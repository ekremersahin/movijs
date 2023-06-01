import { ElementTypes } from ".";
import { IControl } from "../abstractions";

export interface ComponentProps<ElementType extends ElementTypes,StateType> { 
    settings?: { 
        isFrame?:boolean,
        keepAlive?: boolean,
        jump?:boolean,
        transition?: { name?:string } | undefined;
    }  
    model?: StateType;
    setup?(): void; 
    activated?(sender: IControl<any>):void;
    activating?(sender: IControl<any>): void;
    routeChanged?(sender: IControl<any>): void;
    onRouteChanged?(sender: IControl<any>): void;
    interrupt?(sender:IControl<any>,next:()=>any): void;
    onconfig?(sender: IControl<any>): void;
    preconfig?(sender: IControl<any>): void;
    oncreating?(sender:IControl<any>): void;
    oncreated?(sender:IControl<any>): void;     
    onbuilding?(sender:IControl<any>): IControl<ElementType>
    onbuilded?(sender:IControl<any>): IControl<ElementType> 
    ondisposing?(sender:IControl<any>):IControl<ElementType>
    ondisposed?(sender:IControl<any>): void  
    view?: (context:IControl<any>) => IControl<any>;
    reload?: () => IControl<any>;
    using?<T>(waitable: Promise<any>, onfulfilled?: ((value: T) => T | PromiseLike<T>) | undefined | null, onrejected?: ((reason: any) => never | PromiseLike<never>) | undefined | null);
}