import { clearModel,  reactive } from "../../state/src";
import { IControl, IServiceManager } from "./abstractions";
import { IApplicationService, SysInternalNotification } from "./abstractions/IApplicationService";
import { IRouteManager } from "./abstractions/IRouteManager";
import { Component } from "./Component";
import { Dictionary, routeType } from "./core";
import { RouteManager } from "./Router/RouteManager";
import { ServiceManager } from "./ServiceManager";


const AppWatch = new Map<any, any>();
const AppWatchKeys = new Dictionary<string | symbol, Set<any>>();
const latestAppValue = new Dictionary<string | symbol, any>();
export class MoviApplicationService implements IApplicationService {
    public services: IServiceManager = new ServiceManager();
    public extensions: Set<any> = new Set();
    public RouteManager: IRouteManager = new RouteManager();
    public MainPage!: IControl<any>;
    public NotFoundPage!: IControl<any>;
    public Loading!: IControl<any>;
    public ControlCollection:WeakMap<any,any> = new WeakMap();
    public state = {
        GarbageCollection: {
            items: [] as any[],
            add(item: any) {
                this.items.push(item)
            },
            except() {
                this.items.map(c => {
                    c.dispose();
                })
                this.items = [];
            }
        }
    };
     
    public store = {};
    public useModel(data) { return reactive(data) }
    public clearModel(data) { 
        clearModel(data); 
        return null;
    }
    public LifeCycle: Map<any, Set<any>> = new Map<any, Set<any>>();
    constructor() {

    }
    on(eventName: string | symbol, cb: (...args: any[]) => any, ...args) {

        if (AppWatchKeys.has(eventName)) {
            AppWatchKeys.item(eventName).value.add(cb);
        } else {
            AppWatchKeys.Add(eventName, new Set<any>());
            AppWatchKeys.item(eventName).value.add(cb);
        }
        if (latestAppValue.has(eventName)) {
            cb(...latestAppValue.item(eventName).value)
        }
        return () => {
            AppWatchKeys.item(eventName).value.delete(cb);
        };

    }
    send(eventName: string | symbol, ...args: any[]) {
        if (latestAppValue.has(eventName)) {
            latestAppValue.Add(eventName, args);
        }
        AppWatchKeys.item(eventName)?.value?.forEach(t => {
            t(...args)
        })
    }
    watch(fn: () => any) {
        //effect(fn, () => { }).effect;
    }
    internal: SysInternalNotification = new SysInternalNotification();
    route: routeType = null as any;
    use(module: any) {
        if (Reflect.ownKeys(module).includes("name")) {
            if (!this.extensions.has(module)) {

                Reflect.ownKeys(module).forEach(k => {
                    if (typeof module[k] === 'function') {
                        module[k] = module[k].bind(module)
                    }
                })
                var init = {};
                init[module.name] = module;
                this.extensions.add(init);
                if (Reflect.ownKeys(module).includes("install")) {
                    module.install(this);
                    delete module.install;
                }
            }
        } else {
            if (!this.extensions.has(module)) { 
                 
                this.extensions.add(module);
                 
            }
        }
    }

    public CreateObject(type, params) {
        var c = type;

        if (Object.prototype.toString.call(type) === "[object Module]") {
            c = type.default;
        }
        var result;
        if (typeof c === "function") {
            if (c.prototype instanceof Component) {
                result = new c(params);
            } else if (c.prototype && typeof c.prototype.constructor === 'function') {
                try {
                    result = (new c.prototype(params));
                } catch (error) {
                    result = (c(params));
                }
            } else {
                result = c();
            }
            return result;
        }
    }
}

export class ApplicationService {
    public static current: IApplicationService = new MoviApplicationService();
}
