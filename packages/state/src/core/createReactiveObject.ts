import { IModelType } from "../abstract/ModelType"
import { Flags, TargetType } from "../constants"
import { convert, getTargetType, isObject } from "../methods"
import { ArrayHandler } from "../handlers/ArrayHandler";

export function createReactiveObject(
  model: IModelType,
  isReadonly: boolean,
  handler: ProxyHandler<any>,
  collectionHandler: ProxyHandler<any>,
  proxyMap: WeakMap<IModelType, any>,
  root: any,
  key: any
) {
  if (!isObject(model)) {
    return model
  }
  if (model[Flags.RAW] && !(isReadonly && model[Flags.IS_REACTIVE])) {
    return model
  } 
  const existingProxy = proxyMap.get(model)
  if (existingProxy) {
    return existingProxy
  }


  const targetType = getTargetType(model)
  if (targetType === TargetType.INVALID) {
    return model
  }


  const proxy = new Proxy(
    model,
    targetType === TargetType.COLLECTION ? collectionHandler : handler
  )
  proxyMap.set(model, proxy)
  if (Object.keys(proxy).includes('_')) {
    if (typeof proxy['_'] === 'function') {
      proxy['_']();
    };
  }
  return proxy
 
}
