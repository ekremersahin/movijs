
import {  depthReactiveMap, UnwrapNestedRefs } from "../constants";
import { DepthHandler } from "../handlers/DepthHandler";
import {  isReadonly } from "../methods";
import { createReactiveObject } from "./createReactiveObject";

export function reactive<T extends object>(model: T, root?: any,key?:string|symbol): UnwrapNestedRefs<T>
export function reactive(model: object, root?: any,key?:string|symbol) {
    if (isReadonly(model)) { return model } 
    return createReactiveObject(model, false, new DepthHandler(root), new DepthHandler(root), depthReactiveMap, root,key);
}  