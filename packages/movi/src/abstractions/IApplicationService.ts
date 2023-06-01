import { routeType } from "../core/NavigateEventArgs";
import { IControl } from "./IControl";
import { IRouteManager } from "./IRouteManager";
import { IServiceManager } from "./IServiceManager";

const InternalEventStoreMap = new Map<any, any>();

export interface IInternalEventStoreBase {
    event: string
} 
export class SysInternalNotification {
    public subscribe(event, callback): any { 
        if (!InternalEventStoreMap.has(callback)) {
            InternalEventStoreMap.set(callback, event);
        }
        return () => { InternalEventStoreMap.delete(callback) };
    }

    public notify(event: string) { 
        InternalEventStoreMap.forEach((k, v) => { 
            if (k === event) {
                v();
            }
        })
    }
}

export interface IApplicationService {
    services: IServiceManager;
    ControlCollection:WeakMap<any,any>;
    RouteManager: IRouteManager;
    MainPage: IControl<any>;
    NotFoundPage: IControl<any>;
    Loading: IControl<any>;
    state: any;
    store: any;
    LifeCycle: Map<any, Set<any>>;
    route: routeType;
    extensions: Set<any>;
    use(module: any): void;
    internal: SysInternalNotification;
    send(eventName: string, ...args);
    on(eventName: string | symbol, cb: (...args) => any);
    useModel(data): any;
    clearModel(data): any;
    watch(fn: () => any);
    CreateObject(type,params)
}