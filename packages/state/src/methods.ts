
import { IReference } from "./abstract/IReference";
import { IModelType } from "./abstract/ModelType";
import { Flags, TargetType } from "./constants";
import { mapCreator } from "./core/MapCreator";
import { reactive } from "./core/reactive";
import { Depend } from "./core/ReactiveEffect";
import { readonly } from "./core/readonly";

export const isArray = Array.isArray;
export const extend = Object.assign;
const propertyExist = Object.prototype.hasOwnProperty
export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val => propertyExist.call(val, key);
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol';
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';

export const isNonTrackableKeys = mapCreator(`__proto__`)

const symbolMap = Object.getOwnPropertyNames(Symbol)
    .filter(key => key !== 'arguments' && key !== 'caller')
    .map(key => (Symbol as any)[key])
    .filter(isSymbol);

export const builtInSymbols = new Set(symbolMap)

export function isReadonly(value: unknown): boolean {
    return !!(value && (value as IModelType)[Flags.IS_READONLY])
}


export function isSuperficial(value: unknown): boolean {
    return !!(value && (value as IModelType)[Flags.IS_SUPERFICIAL])
}

export function targetTypeMap(rawType: string) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return TargetType.COMMON
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return TargetType.COLLECTION
        default:
            return TargetType.INVALID
    }
}

export const isNumericKey = (key: unknown) => isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;
export const toNumeric = (val: any): any => {
    const n = parseFloat(val)
    return isNaN(n) ? val : n
}

export const isModified = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)


export function isReference<T>(r: IReference<T> | unknown): r is IReference<T>
export function isReference(r: any): r is IReference {
    return !!(r && r.__isReference__ === true)
};

export function getTargetType(value: IModelType) {
    return value[Flags.SKIP] || !Object.isExtensible(value)
        ? TargetType.INVALID
        : targetTypeMap(convert.toRawType(value))
}

export const objectToString = Object.prototype.toString

export const isMap = (val: unknown): val is Map<any, any> =>
    convert.toTypeString(val) === '[object Map]'

export function isReactive(observed: any): boolean {
    const raw = observed && (observed as unknown as IModelType)[Flags.IS_REACTIVE]
    return raw ? isReactive(raw) : observed
}
export function  toReactive(model: IModelType,root?:any):any {
    return reactive(model,root) as any
}
export const convert = {
    toRaw<T>(observed: T): T {
        const raw = observed && (observed as IModelType)[Flags.RAW]
        return raw ? convert.toRaw(raw) : observed
    }, 
    toReadonlyReactive(model: IModelType) {
        return readonly(model)
    },
    toTypeString(value: unknown): string { return objectToString.call(value) },
    toRawType(value: unknown): string {
        return convert.toTypeString(value).slice(8, -1)
    }
}

