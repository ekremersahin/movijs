import { IControl } from "./IControl";
import { IRouter } from "./Router";

export class RouteRecord{
    control: IControl<any> | Promise<IControl<any>> | undefined;
    layout:  IControl<any> | Promise<IControl<any>> | undefined;
    path: string | undefined;
    parent: RouteRecord| undefined;
    ParentPath: string| undefined;
    isDefault: boolean| undefined;
    instances: {
        layout: IControl<any>;
        control: IControl<any>;
    } | undefined;
    extend?: any = {};
    onShow?: (e: IControl<any>) => void;
    public name: string | undefined;
    public default?: any;
}

export interface IChildRoute { 
    AddRoute(Patern: string, Page:any): IChildRoute;
}
export class RouteItem { 
    public path:string | undefined;
    public control: any;  
    public childs?: RouteItem[] = [];
    public extend?: any = {};
    onShow?: (e: IControl<any>) => void; 
    public name:string | undefined
}

export interface IRouteManager {
    routes: Map<any, RouteRecord>; 
    add(item: RouteItem):void;  
    get(name: string): RouteRecord;
    router: IRouter; 
   // navigate(url: string):void;
}
