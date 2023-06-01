import { ApplicationService } from "../../../movi/src/ApplicationService";
import { IModelType } from "../abstract/ModelType";
import { depthReactiveMap, Flags, readonlyMap, sfReactiveMap, sfReadonlyMap, TrackEvent, TriggerEvent } from "../constants";
import { getEffects, track, trigger } from "../core/effect";
import { convert, isNumericKey } from "../methods";
import { 
    createSetter,
    createHas,
    createDelete,
    createOwn
} from "./main"

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


export class ArrayHandler<T extends object> implements ProxyHandler<T>{
    ///'includes', 'indexOf', 'lastIndexOf'
    get = (target, key, receiver) => {

        if (key === Flags.IS_REACTIVE) { return true }
        else if (key === Flags.IS_READONLY) { return false }
        else if (key === Flags.IS_SUPERFICIAL) { return false }
        else if (key === Flags.RAW && isEqual(target, receiver, false, false)) {
            return target
        } else if (key === Flags.CONTEXT) {
            return ApplicationService.current;
        }

        var result = Reflect.get(target, key, receiver);
        switch (key) {
            case 'length':
            case 'includes':
            case 'indexof':
            case 'splice':
            case 'slice':
            case 'lastIndexOf':
                const arr = convert.toRaw(target) as any
                if (Array.isArray(this)) {
                    for (let i = 0, l = this.length; i < l; i++) {
                        track(arr, TrackEvent.GET, i + '')
                    }
                }
                break;
            default:
                if (!isNumericKey(key)) {
                    const arr = convert.toRaw(target) as any
                    console.error('ArrayHandler', getEffects(target), arr, key)
                    trigger(arr, TriggerEvent.SET, 'length');
                }
                break;
        }


        return result;
    };
    set = createSetter(false);
    has = createHas();
    deleteProperty = createDelete();
    ownKeys = createOwn();
    constructor(public root?: any) { }
}
