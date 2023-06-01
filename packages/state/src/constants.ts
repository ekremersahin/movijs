import { IReference } from "./abstract/IReference";
import { IModelType } from "./abstract/ModelType"
import { Depend } from "./core/ReactiveEffect";
import { DepthHandler } from "./handlers/DepthHandler";
export declare const ComputedRefSymbol: unique symbol
export declare const RefSymbol: unique symbol
export declare const RawSymbol: unique symbol
export declare const sfReactiveMarker: unique symbol
export declare const sfRefMarker: unique symbol
export const enum Flags {
    SKIP = '[__skip__]',
    IS_REACTIVE = '[__isReactive__]',
    IS_READONLY = '[__isReadonly__]',
    IS_SUPERFICIAL = '[__issuperficial__]',
    RAW = '[__raw__]',
    CONTEXT = 'context'
}

export const enum TargetType {
    INVALID = 0,
    COMMON = 1,
    COLLECTION = 2
}


export const enum TrackEvent {
    GET = 'get',
    HAS = 'has',
    ITERATE = 'iterate'
}

export const enum TriggerEvent {
    SET = 'set',
    ADD = 'add',
    DELETE = 'delete',
    CLEAR = 'clear',
    MODIFY = "modify"
}

export const depthReactiveMap = new WeakMap<IModelType, any>()
export const sfReactiveMap = new WeakMap<IModelType, any>()
export const readonlyMap = new WeakMap<IModelType, any>()
export const sfReadonlyMap = new WeakMap<IModelType, any>()

export const depthHandler = new DepthHandler();


export const ITERATE_KEY = Symbol('')
export const MAP_KEY_ITERATE_KEY = Symbol('')
 
type KeyToDepMap = Map<any, Depend> 
export const targetMap = new WeakMap<any, KeyToDepMap>()
export const ArrayParentMap = new WeakMap();

export type CollectionTypes = IterableCollections | WeakCollections
export interface RefUnwrapBailTypes { }
export type IterableCollections = Map<any, any> | Set<any>
export type WeakCollections = WeakMap<any, any> | WeakSet<any>
export type MapTypes = Map<any, any> | WeakMap<any, any>
export type SetTypes = Set<any> | WeakSet<any>
export type BaseTypes = string | number | boolean

export type SuperficialRef<T = any> = IReference<T> & { [sfRefMarker]?: true }
export type UnwrapRef<T> = T extends SuperficialRef<infer V>
    ? V : T extends IReference<infer V>
    ? UnwrapRefSimple<V> : UnwrapRefSimple<T>

export type UnwrapRefSimple<T> = T extends | Function | CollectionTypes | BaseTypes | IReference | RefUnwrapBailTypes[keyof RefUnwrapBailTypes] | { [RawSymbol]?: true }
    ? T : T extends Array<any>
    ? { [K in keyof T]: UnwrapRefSimple<T[K]> } : T extends object & { [sfReactiveMarker]?: never }
    ? { [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]> } : T

export type UnwrapNestedRefs<T> = T extends IReference ? T : UnwrapRefSimple<T>