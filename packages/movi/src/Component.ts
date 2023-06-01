import { ApplicationService } from "./ApplicationService";
import { MoviComponent } from "./ComponentBase";
import { ComponentProps,   CreateLocalElement, ElementTypes } from "./core";
 
export class Component<
    ElementType extends ElementTypes, StateType> extends MoviComponent<ElementType, StateType> {
    constructor()
    constructor(tag: ElementType | string)
    constructor(options: ComponentProps<ElementType, StateType>)
    constructor(tag: ElementType | string, options: ComponentProps<ElementType, StateType>)
    constructor() {
        var tag;
        var props;


        if (tag !== undefined && typeof tag === 'function') {
            var caller = (tag as any)(props);
            super(caller.element, caller)

        } else {

            if (arguments.length === 1) {
                var arg = arguments[0];
                if (typeof arg === "object" && (arg instanceof Element) === false) {
                    if (arg) {
                        props = arg;
                    }

                } else {
                    tag = arg;
                }
            } else if (arguments.length === 2) {
                tag = arguments[0];
                if (arguments[1]) {
                    props = arguments[1];
                }
            }


            var findChild = () => {


                // if (this.element.hasChildNodes()) { 
                //     this.element.childNodes.forEach(cn => { 
                //        this.add(moviComponent(cn)); 
                //     })
                // }
            }

            if ((tag === undefined || tag === null) && (props === undefined || props === null)) {
                super(tag as any, props as any)
            } else if (tag === undefined && props !== undefined) {
                super(CreateLocalElement(tag), props)

            } else if (tag && !props) {

                super(CreateLocalElement(tag), props as any)
                findChild();

            } else if (tag && props) {

                super(CreateLocalElement(tag, props['__isSvgElement']), props)
                findChild();

            }


        }


    }
     
}

 
export function AsyncContainer(importer, props) { 
    var result = new MoviComponent(null, {});
    if (importer instanceof Promise) {
        result.using(importer, (c: any) => {
            result.controls.add(resolveElement(c.default, props));
        })
    }
    return result;
} 

const Components = new Set();
Components.add('movicompoent');
export function moviComponent(tag?: any, options?: any): Component<any, any> {
    if (typeof tag === 'string' || tag instanceof Element) {
        if (tag instanceof HTMLSlotElement || tag === 'slot') {
            if (options && options.props) {
                options.props['isSlot'] = true;
            } else {
                options = { ...options, props: { isSlot: true } }
            }
            return resolveElement(null, { ...options });
        } else
            if (tag instanceof HTMLUnknownElement) {
                return resolveElement('div', options);
            } else if (typeof tag === 'function') { 
                return new Component({ view: () => tag, ...options });
            } else { 
                return new Component(tag, options);
            }

    } else {

        return resolveElement(tag, options);
    }
}

export function createElement(tag: any, options: any): Component<any, any> {
    if (typeof tag === 'string' || tag instanceof Element) {
        return new Component(tag, options);
    } else {
        return resolveElement(tag, options);
    }
}

export function moviFragment(options: any): Component<any, any> {
    // console.error("[MOVIJS]: fragment is not supported. auto convert to div element.")
    // return moviComponent('div', {...options});
    return new MoviComponent(null, { ...options });
    var ops = {
        settings: { isFrame: true },
        isFragment: true,
        ...options
    };

    // var f = new Fragment<any>(ops);// new Component({ isFragment: true, ...options });
    // console.error(options)
    // // f.onmounted = (s) => { 
    // //     //Object.assign(s, options);


    // // }
    // // f.onbuilded = (sender) => { 
    // //     if (options.nodes && Array.isArray(options.nodes)) { 
    // //         options.nodes.forEach(txs => {
    // //            // s.controls.add(moviComponent('div', {}))
    // //            // console.error('Mounted',s.controls._map.has(txs))
    // //             sender.controls.add(txs);
    // //         })
    // //     } 
    // //     console.error('onbuilded',sender);
    // //     return sender;
    // // }
    // // //Object.assign(f, options);
    // // //f.controls.add(moviComponent('div', {}))
    // // console.error('fragment',f);
    // return f;
}
 

function resolveElement(tag, props): Component<any, any> {
  
    var controller: any;
    const Ctx = Object.assign({}, {
        context: ApplicationService.current,
    })

    if (Array.isArray(tag)) {
        controller = tag[0];
    } else if (tag instanceof Component) {
        controller = tag;
    } else if (typeof tag === "function") {


        try {
            // tag = tag.bind(Ctx)
            var getFn = tag;


            if (getFn instanceof Component || (getFn.prototype && getFn.prototype instanceof Component)) {
                var p = props['props'];
                delete props['props'];
                controller = new getFn({ ...p, ...props });
                controller.props = p;
                p && Object.keys(p).forEach(pname => {
                    // delete controller[pname];
                })

            } else if (typeof getFn === 'object') {
                controller = new Component({ ...getFn, ...Ctx, ...props });
            } else {
                var ntag;
                try {
                    ntag = new tag({ ...Ctx, ...props });
                } catch (err) {
                    ntag = tag();
                }

                if (ntag instanceof Promise) {
                    controller = AsyncContainer(ntag, props);
                } else {
                    controller = new Component({ view: () => ntag, ...props })
                }
 
            }
 
        } catch (error) {


            controller = new tag(Ctx);
            if (!controller['bind']) {
                controller = Object.assign(controller, new Component(props));
            } 
        }
    } else {

        controller = new Component({ ...tag, ...Ctx, ...props });
 
    }

    return controller;
}



