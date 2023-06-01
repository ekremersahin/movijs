import { IDirective } from "../../../movi/src/abstractions/IDirective";
import { Flags, ITERATE_KEY, MAP_KEY_ITERATE_KEY, targetMap, TriggerEvent } from "../constants";
import { convert, extend, isArray, isMap, isNumericKey, isReactive, objectToString, toNumeric } from "../methods";
import { recordEffectScope } from "./EffectScope";
import { reactive } from "./reactive";
import { activeEffect, activeBindable, Bindable, createDep, Depend, effectTrackDepth, followTracking, IReactiveEffectOptions, IReactiveEffectRunner, maxMarkerBits, newTracked,  setfollowTracking, trackOpBit, wasTracked } from "./ReactiveEffect";


export function track(model: object, type: any, key: unknown) {

    if (followTracking && activeBindable  ) { ///&& isNumericKey(key) === false
        //activeEffect.setup(model, key);
        activeEffect?.setup(model, key);
        window["tmap"] = targetMap; 
        var afrm = activeBindable; 
        let depsMap = targetMap.get(model)
        if (!depsMap) {
            targetMap.set(model, (depsMap = new Map()))
        }
  
        let dep = depsMap.get(key)
        if (!dep) {
            depsMap.set(key, (dep = createDep())) 
        }
        
        trackEffects(dep)
        if (afrm.isInstalled === false && afrm.setup) {

            afrm.setup(reactive(model), key)
        };

    }
}

export function trackArray(model: object, fx: any, key: unknown) {

    if (fx  ) { ///&& isNumericKey(key) === false
        //activeEffect.setup(model, key);
       
        let depsMap = targetMap.get(model)
        if (!depsMap) {
            targetMap.set(model, (depsMap = new Map()))
        }
  
        let dep = depsMap.get(key)
        if (!dep) {
            depsMap.set(key, (dep = createDep())) 
        } 
        trackEffects(dep) 
    }
}
export function trackEffects(dep: Depend) {
    let shouldTrack = false
    if (effectTrackDepth <= maxMarkerBits) {
        if (!newTracked(dep)) {
            dep.n |= trackOpBit // set newly tracked
            shouldTrack = !wasTracked(dep)
        }
    } else {
        // Full cleanup mode.
        shouldTrack = !dep.has(activeBindable!)
    }

    if (shouldTrack) {
        if (activeBindable) {
            if (!dep.has(activeBindable)) { 
                dep.add(activeBindable!)
            }
         
            activeBindable!.deps.push(dep) 
        }
      
    }
}


export function trigger(
    target: object,
    type: any,
    k?: unknown,
    newValue?: unknown,
    oldValue?: unknown,
    oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
    var key = k;
    var senderKey = k;
    var depsMap = targetMap.get(target)
    
    if (!depsMap) { 
        return
    }
   
    let deps: (Depend | undefined)[] = []
    if (type === TriggerEvent.CLEAR) {
        deps = [...depsMap.values()]
    } else if (type === TriggerEvent.MODIFY) {  
        key = "modify";
        deps.push(depsMap.get('length'))
        senderKey = "modify";
    } else if (key === 'length' && isArray(target)) {
        depsMap.forEach((dep, key) => {
            if (key === 'length' || key >= toNumeric(newValue)) {
                deps.push(dep)
            }
        })
    } else {
        if (key !== void 0) {
            deps.push(depsMap.get(key))
        }
       
        switch (type) {
            case TriggerEvent.ADD:
                if (!isArray(target)) {
                    deps.push(depsMap.get(ITERATE_KEY))
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
                    }
                } else if (isNumericKey(key)) {
                     //deps.push(depsMap.get('length'))
                }
                break
            case TriggerEvent.DELETE:
                if (!isArray(target)) {
                    deps.push(depsMap.get(ITERATE_KEY))
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
                    }
                }
                break
            case TriggerEvent.SET:
                if (isMap(target)) {
                    deps.push(depsMap.get(ITERATE_KEY))
                }
                break
        }
    }

 
    if (deps.length === 1) {
        if (deps[0]) {
            triggerEffects(deps[0],senderKey)
        }
    } else {
        const effects: Bindable[] = []
        for (const dep of deps) {
            if (dep) {
                effects.push(...dep)
            }
        }
        triggerEffects(createDep(effects),senderKey)
    }
}

export function getEffects(
    target: object 
) {  
   
    var depsMap = targetMap.get(target) 
    if (!depsMap) { 
        return
    } 
    let deps: (Depend | undefined)[] = []


    depsMap.forEach((dep, key) => {
        deps.push(dep)
    }) 
    deps.push(depsMap.get(ITERATE_KEY))
    deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
        

    const effects: Bindable[] = []
    if (deps.length === 1) {
        if (deps[0]) {
            effects.push(...deps[0]) 
        }
    } else { 
        for (const dep of deps) {
            if (dep) {
                effects.push(...dep)
            }
        } 
    }
   
    //depsMap.delete(target);
    return createDep(effects)
}

export function getEffectsFromKey(
    target: object,
    key:any
) {  
   
    var depsMap = targetMap.get(target) 
    if (!depsMap) { 
        return
    } 
    let deps: (Depend | undefined)[] = []


    depsMap.forEach((dep, key) => {
        deps.push(dep)
    }) 
    deps.push(depsMap.get(ITERATE_KEY))
    deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
        

    const effects: Bindable[] = []
    if (deps.length === 1) {
        if (deps[0]) {
            effects.push(...deps[0]) 
        }
    } else { 
        for (const dep of deps) {
            if (dep) {
                effects.push(...dep)
            }
        } 
    }
   
    //depsMap.delete(target);
    return createDep(effects)
}

export function triggerEffects(
    dep: Depend | Bindable[], key: any) {
        
    const effects = isArray(dep) ? dep : [...dep]
    for (const effect of effects) {
        
        triggerEffect(effect,key)
    }

}

function triggerEffect(
    effect: Bindable, key: any) {
      
    if (effect !== activeBindable) { 
        effect.run(key)
    }
}

function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay = 300): T {
    let prevTimer: number | null = null;
    return ((...args: any[]) => {
        if (prevTimer) {
            clearTimeout(prevTimer);
        }
        prevTimer = window.setTimeout(() => {
            fn(...args);
            prevTimer = null;
        }, delay);
    }) as any;
}


export function directTrack(model: object, key: unknown) {
    var m = reactive(model);
    track(m, 'GET', key);

}
 

export function bindEffect<T = any>(fn:IDirective<any>): IReactiveEffectRunner<T> { 
    const _effect = new Bindable<T>(fn);
    const runner = _effect.run.bind(_effect) as IReactiveEffectRunner
    runner.effect = _effect;
    _effect.run()
    return runner
}

const trackStack: boolean[] = []

export function pauseTracking() {
    trackStack.push(followTracking)
    setfollowTracking(false);
}

export function enableTracking() {
    trackStack.push(followTracking)
    setfollowTracking(true);
}

export function resetTracking() {
    const last = trackStack.pop()
    setfollowTracking(last === undefined ? true : last);
}

export function clearModel(model) {
  
    if (model) { 
        Object.keys(model).forEach((key) => {
            try {
                if (typeof model[key] === 'object' && model[key][Flags.IS_REACTIVE]) {  
                    clearModel(model[key])
                    //targetMap.delete(model[key])
                } 
            } catch (error) {
                
            }
           
           
            //if(typeof model[key] === 'object'){clearModel(model[key])}
            targetMap.delete(model[key])
            targetMap.delete(convert.toRaw(model[key]))
        })
        targetMap.delete(convert.toRaw(model))
        targetMap.delete(model)
    }
    
}