import { ApplicationService } from "../../../movi/src/ApplicationService"
import { IModelType } from "../abstract/ModelType"
import { Flags, depthReactiveMap, readonlyMap, sfReactiveMap, sfReadonlyMap, ITERATE_KEY, TrackEvent, TriggerEvent, targetMap } from "../constants"
import { pauseTracking, resetTracking, track, trigger } from "../core/effect"
import { reactive } from "../core/reactive" 
import { builtInSymbols, hasOwn, isArray, isNonTrackableKeys, isObject, isSymbol, convert, isReadonly, isSuperficial, isNumericKey, isReference, isModified, toReactive } from "../methods"
function FindOwnedMap(isReadonly = false, superficial = false): WeakMap<IModelType, any> {
    return (isReadonly
        ? superficial
            ? sfReadonlyMap
            : readonlyMap
        : superficial
            ? sfReactiveMap
            : depthReactiveMap
    )
}
function isEqual(target: IModelType, receiver: object, isReadonly = false, superficial = false): boolean {
    return receiver === FindOwnedMap(isReadonly, superficial).get(target)
}


const ArrayMethods = createArrayMethods()

function createArrayMethods() {
    const methods: Record<string, Function> = {}
        ; (['includes', 'indexOf', 'lastIndexOf'] as const).forEach(key => {
            methods[key] = function (this: unknown[], ...args: unknown[]) {
                const arr = convert.toRaw(this) as any
                //console.error('inc',key, arr);
                if (Array.isArray(this)) {
                    for (let i = 0, l = this.length; i < l; i++) {
                        track(arr, TrackEvent.GET, i + '')
                    }
                }
                const res = arr[key](...args)
                if (res === -1 || res === false) {
                    return arr[key](...args.map(convert.toRaw))
                } else {
                    return res
                }
            }
        });
    var pb;
    (['push', 'pop', 'shift', 'unshift', 'splice'] as const).forEach(key => {
        methods[key] = function (this: unknown[], ...args: unknown[]) {
            pauseTracking()
            const res = (convert.toRaw(this) as any)[key].apply(this, args)
            resetTracking()
            try {
                return res
            } catch (error) {

            } finally {
                window.clearTimeout(this['breaker']);
                this['breaker'] = window.setTimeout(async () => {
                    await new Promise((tx: any) => {
                        tx();
                        const arr = convert.toRaw(this) as any
                        // trigger(this, TriggerEvent.SET, 'length');
                        trigger(arr, TriggerEvent.SET, 'length');
                    })
                    // trigger(this, TriggerEvent.SET, 'length');
                }, 0)

            }
        }
    });

    (['reverse'] as const).forEach(key => {
        methods[key] = function (this: unknown[], ...args: unknown[]) {

            pauseTracking()
            const res = (convert.toRaw(this) as any)[key].apply(this, args)
            resetTracking()
            try {
                return res
            } catch (error) {

            } finally {
                const arr = convert.toRaw(this) as any
                // trigger(this, TriggerEvent.SET, 'reverse');
                //trigger(arr, TriggerEvent.SET, 'length');
                trigger(arr, TriggerEvent.MODIFY, 'length');
            }
        }
    });

    return methods
}


export function createGetter(isReadonly = false, superficial = false) {

    return function get(model: IModelType, key: string | symbol, receiver: object) {

        if (key === Flags.IS_REACTIVE) { return !isReadonly }
        else if (key === Flags.IS_READONLY) { return isReadonly }
        else if (key === Flags.IS_SUPERFICIAL) { return superficial }
        else if (key === Flags.RAW && receiver === depthReactiveMap.get(model)) {
            return model
        } else if (key === Flags.CONTEXT) {
            return ApplicationService.current;
        }
        const modelIsArray = isArray(model)

        if (!isReadonly && modelIsArray && hasOwn(ArrayMethods, key)) {
            return Reflect.get(ArrayMethods, key, receiver)
        }

        const res = Reflect.get(model, key, receiver)
      
        if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
            return res
        }

       

        if (!isReadonly) {
            track(model, TrackEvent.GET, key)
        }

        if (superficial) {
            return res
        }

        if (isReference(res)) {
            return modelIsArray && isNumericKey(key) ? res : res.value
        }

        if (isObject(res)) {
            return isReadonly ? convert.toReadonlyReactive(res) : reactive(res, model, key)
        }
    
        return res
    }
}

export function createSetter(superficial = false) {
    return function set(
        model: object,
        key: string | symbol,
        value: unknown,
        receiver: object
    ): boolean {
        let oldValue = (model as any)[key]

        if (isReadonly(oldValue) && isReference(oldValue) && !isReference(value)) {
            return false
        }
        if (!superficial) {
            if (!isSuperficial(value) && !isReadonly(value)) {
                oldValue = convert.toRaw(oldValue)
                value = convert.toRaw(value)
            }
            if (!isArray(model) && isReference(oldValue) && !isReference(value)) {
                oldValue.value = value
                return true
            }
        } else {

        }

        if (isArray(value) && isArray(model[key])) {
            var older = model[key];
            targetMap.delete(older);
        }
        const isNew =
            isArray(model) && isNumericKey(key)
                ? Number(key) < (model.length)
                : hasOwn(model, key)
        const result = Reflect.set(model, key, value, receiver)

        try {
            return result
        } catch (error) {
            console.error(error)
            return result;
        } finally {

            if (model === convert.toRaw(receiver)) {
                if (!isNew) {
                    trigger(model, TriggerEvent.ADD, key, value)
                } else if (isModified(value, oldValue)) {

                    if (Array.isArray(model)) {
                        if (key === 'length') {
                            trigger(model, TriggerEvent.SET, key, value)
                        }
                        //else if (key === 'reverse') {
                        //  trigger(model, TriggerEvent.SET, key, value)
                        //}
                    } else {
                        trigger(model, TriggerEvent.SET, key, value)
                    }
                }
            }
        }
    }
}


export function createDelete(superficial = false) {
    return function deleteProperty(model: object, key: string | symbol): boolean {
        const isOwned = hasOwn(model, key)
        const oldValue = (model as any)[key]
        const result = Reflect.deleteProperty(model, key)
        if (result && isOwned) {
            //console.error('Delete')
            //trigger(model, TriggerEvent.DELETE, key, oldValue)
        }
        return result
    }
}



export function createHas() {
    return function has(model: object, key: string | symbol): boolean {
        const result = Reflect.has(model, key)
        if (!isSymbol(key) || !builtInSymbols.has(key)) {
            track(model, TrackEvent.HAS, key)
        }
        return result
    }
}


export function createOwn() {
    return function ownKeys(model: object): (string | symbol)[] {

        track(model, TrackEvent.ITERATE, isArray(model) ? 'length' : ITERATE_KEY)
        return Reflect.ownKeys(model)
    }
}
