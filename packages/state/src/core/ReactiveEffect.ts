import { IControl } from "../../../movi/src/abstractions";
import { IDirective } from "../../../movi/src/abstractions/IDirective";
import { targetMap } from "../constants";
import { convert } from "../methods";
import { recordEffectScope } from "./EffectScope";

export type EffectScheduler = (...args: any[]) => any
type TrackedMarkers = {
    w: number
    n: number
}



export interface IEffectScope {
    active: boolean;
    effects: Bindable[];
    cleanups: (() => void)[];
    parent: IEffectScope | undefined;
    scopes: IEffectScope[] | undefined;
    index: number;
    run<T>(fn: () => T): T | undefined;
    on();
    off();
    stop(fromParent?: boolean);

}


export interface IReactiveEffectOptions {
    lazy?: boolean
    scheduler?: EffectScheduler
    scope?: IEffectScope
    reIteration?: boolean
    control?: IControl<any>
    props?: any
    isArray?: boolean;
}

export interface IReactiveEffectRunner<T = any> {
    (): T
    effect: Bindable
}



export type Depend = Set<Bindable> & TrackedMarkers


export let activeEffect: Bindable | undefined;
export let effectTrackDepth = 0;
export let trackOpBit = 1;
export var followTracking = true;
export const maxMarkerBits = 30;
export let activeBindable: Bindable | undefined;

 

export function setfollowTracking(v: boolean) {
    followTracking = v;
}

export const createDep = (effects?: Bindable[]): Depend => {
    const dep = new Set<Bindable>(effects) as unknown as Depend
    dep.w = 0
    dep.n = 0
    return dep
}

export const wasTracked = (dep: Depend): boolean => (dep.w & trackOpBit) > 0

export const newTracked = (dep: Depend): boolean => (dep.n & trackOpBit) > 0

export const startDepPointers = ({ deps }: Bindable) => {
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].w |= trackOpBit // set was tracked
        }
    }
}

export const endDepPointers = (effect: Bindable) => {
    const { deps } = effect
    if (deps.length) {
        let ptr = 0
        for (let i = 0; i < deps.length; i++) {
            const dep = deps[i]
           
            if (wasTracked(dep) && !newTracked(dep)) {
                dep.delete(effect)
            } else {
                deps[ptr++] = dep
             //   console.error('dep')
            }
            // clear bits
            dep.w &= ~trackOpBit
            dep.n &= ~trackOpBit
           // deps[ptr++] = dep 
        }
        deps.length = ptr
    }
}

function clearAllDepFX(effect: Bindable) {
    const { deps } = effect
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect)
        }
        deps.length = 0
    }
}
 

export class Bindable<T = any>{
    active = true
    deps: Depend[] = []
    parent: Bindable | undefined = undefined
    private deferStop?: boolean
    isInstalled: boolean = false;

    constructor(public directive: IDirective<any>) { 
        recordEffectScope(this);
    }
    async _call(val, cb: (val: any) => any) {
        if (!this.active) {
            return cb(val);
        }
        this.active = true;
        let parent = activeBindable
        let lastfollowTracking = followTracking

        while (parent) {
            if (parent === this) {
                return
            }
            parent = parent.parent
        }
        try {
            this.parent = activeBindable
            activeBindable = this
            followTracking = true

            trackOpBit = 1 << ++effectTrackDepth

            if (effectTrackDepth <= maxMarkerBits) {
                 startDepPointers(this)
            } else {
                 clearAllDepFX(this)
            }
            return cb(val);
        } finally {
            if (effectTrackDepth <= maxMarkerBits) {
                endDepPointers(this)
            }

            trackOpBit = 1 << --effectTrackDepth

            activeBindable = this.parent
            followTracking = lastfollowTracking
            this.parent = undefined;
            if (this.deferStop) {
                this.stop(null, null)
            }
        }
    }
    async run(key?: any) {
        if (this.isInstalled) {
            if (this.directive.update) this._call(null, this.directive.update)
        } else { 
            if (this.directive.start) this._call(null, this.directive.start)
        } 
    } 
    async push(val: any) { if (this.directive.push) this._call(val, this.directive.push)}
    async splice(val) { if (this.directive.splice) this._call(val, this.directive.splice) }
    async slice(val) { if (this.directive.slice) this._call(val, this.directive.slice) }
    async pop(val) { if (this.directive.pop) this._call(val, this.directive.pop) }
    async shift(val) { if (this.directive.shift) this._call(val, this.directive.shift) }
    async unshift(val) { if (this.directive.unshift) this._call(val, this.directive.unshift) }
    async set(val) { if (this.directive.set) this._call(val, this.directive.set) }
    async reverse(val) { if (this.directive.reverse) this._call(val, this.directive.reverse) }
    async setup(target, key) { if (this.directive.setup) this.directive.setup(target,key) }
    async stop(prop, key) {
        if (activeBindable === this) {
            this.deferStop = true
        } else if (this.active) {
            clearAllDepFX(this) 
            this.active = false
        }



    }
    remove(state) {
        if (state) {
            Object.keys(state).forEach((key) => {
                if (typeof state[key] === 'object') { this.remove(state[key]) }
                targetMap.delete(state[key])
                targetMap.delete(convert.toRaw(state[key]))
            })
        }
        targetMap.delete(convert.toRaw(state));
        targetMap.delete(state);
    }
}