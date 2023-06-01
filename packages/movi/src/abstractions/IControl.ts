import { Collection, ComponentProps, ElementTypes, styleKeys } from "../core";
import { controlAttribute } from "../core/controlAttribute";
import { Directive } from "../../../state/src/directive";
import { IApplicationService } from "./IApplicationService";
import { UnwrapNestedRefs } from "../../../state/src/constants";
import { IClass } from "./IAttribute";
import { controlStyle } from "../core/controlStyle";
export interface IControl<ElementType extends ElementTypes> extends ComponentProps<ElementType,any> {
    bind: Directive;
    isFragment: boolean; 
    //state: UnwrapNestedRefs<any>;
    handleDispose(cb:()=>any);
    context: IApplicationService;
    controls:Collection<IControl<any>>
    parent: IControl<ElementTypes>;
    element: ElementType;  
    build(target?: any);
    wait(): IControl<ElementType>; 
    dispose(external?:boolean); 
    flush();
    clear();
    show();
    hide();
    on(eventName: string | symbol,cb:(...args)=>any,...initialValues);
    addHandler(event: string, callback: (sender: IControl<ElementType>, e: Event) => any): IControl<ElementType>;
    removeHandler(event: string ):IControl<ElementType>;
    attr: controlAttribute<ElementType>;
    class: IClass<ElementType>;
    isRendered: boolean;
    isDisposed: boolean;
    isConnected: boolean; 
    style(properties: styleKeys): IControl<ElementType>;
    autostyle: controlStyle<ElementType>;
    view?(context:any):any;
    using<T>(waitable: Promise<any>, onfulfilled?: ((value: T) => T | PromiseLike<T>) | undefined | null, onrejected?: ((reason: any) => never | PromiseLike<never>) | undefined | null);
    registerStyle(style: any): IControl<ElementType>
    useModel<T extends object>(model: T): UnwrapNestedRefs<T>
    useModel(model: object);
    props:any
}
