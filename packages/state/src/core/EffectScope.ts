import { IEffectScope, Bindable } from "./ReactiveEffect"



let activeEffectScope: IEffectScope | undefined

export class EffectScope implements IEffectScope { 
    active = true 
    effects: Bindable[] = [] 
    cleanups: (() => void)[] = [] 
    parent: IEffectScope | undefined 
    scopes: IEffectScope[] = []; 
    public index: number = 0;

    constructor(public detached = false) {
        this.parent = activeEffectScope;
       
        if (!detached && activeEffectScope) {
            this.index =
                (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push((this as unknown as IEffectScope)) - 1
        }
    }

    run<T>(fn: () => T): T | undefined {
        if (this.active) {
            const currentEffectScope = activeEffectScope
            try {
                activeEffectScope = (this as unknown as IEffectScope)
                return fn()
            } finally {
                activeEffectScope = currentEffectScope
            }
        }
    }
 
    on() {
         
        activeEffectScope = this
    }
 
    off() {
        activeEffectScope = this.parent
    }

    stop(fromParent?: boolean) {
        if (this.active) {
            let i, l
            for (i = 0, l = this.effects.length; i < l; i++) {
                this.effects[i].stop(null, null)
            }
            for (i = 0, l = this.cleanups.length; i < l; i++) {
                this.cleanups[i]()
            }
            if (this.scopes) {
                for (i = 0, l = this.scopes.length; i < l; i++) {
                    this.scopes[i].stop(true)
                }
            }
            // nested scope, dereference from parent to avoid memory leaks
            if (!this.detached && this.parent && !fromParent) {
                // optimized O(1) removal
                const last = this.parent.scopes!.pop()
                if (last && last !== this) {
                    this.parent.scopes![this.index!] = last
                    last.index = this.index!
                }
            }
            this.parent = undefined
            this.active = false
        }
    }
}

export function effectScope(detached?: boolean) {
    
    return new EffectScope(detached)
}

export function recordEffectScope(
    effect: Bindable,
    scope: IEffectScope | undefined = activeEffectScope
) {
    if (scope && scope.active) {
        scope.effects.push(effect)
      
    }
}

export function getCurrentScope() {
    
    return activeEffectScope
}

export function onScopeDispose(fn: () => void) {
    if (activeEffectScope) {
        activeEffectScope.cleanups.push(fn)
    }
}