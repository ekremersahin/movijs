import { UnwrapNestedRefs } from "../../state/src/constants";
import { Directive } from "../../state/src/directive";

import { IClass, IControl } from "./abstractions";
import { IApplicationService } from "./abstractions/IApplicationService";
import { ApplicationService } from "./ApplicationService";
import { Collection, controlAttribute, ElementTypes, KeyValueItem, styleKeys, toKebab } from "./core";
import { controlClass } from "./core/controlClass";
import { controlStyle } from "./core/controlStyle";
import { system } from "./environment";
var counter = 0;
const PlaceholderElement: Comment = document.createComment('');

export class StateTypeBase<T = Object>{
    context = ApplicationService.current;
    slots: [] = [];
}
export class MoviComponent<ElementType extends ElementTypes, StateType> implements IControl<ElementType>{
    public props: StateType = null as StateType;
    private _initprops = false;

    private _ = {
        placeholder: PlaceholderElement.cloneNode(true) as Comment,
        isMainComponent: false,
        isContainer: false,
        waitInit: false,
        waitState: false,
        isInited: false,
        viewInit: false,
        on: new Set<any>(),
        isHidden: false,
        replacedHidden: false,
        instanced: false,
        initializing: {
            wait: () => {
                if (!this._.waitInit) {
                    if (this._.waitState === false && this.bind.Configuration.WaitSettings && this.bind.waitDirective) {
                        this.parent["_"].methods.AppendElement(this);
                        this.hide();
                        this._.waitState = true;
                        this._.waitInit = true;
                        this.bind.waitDirective.init(this.bind.Configuration.WaitSettings, this);
                        return true;
                    }
                }
                return false;
            }
        },
        event: {
            onbuilding: () => {
                if (this._.isInited === false && this['onbuilding']) { this['onbuilding'](this); }
                if (!this._.isInited) {
                    if (this['intervention'] && this['intervention']['onbuilding']) {
                        this['intervention']['onbuilding'](this)
                    }
                }
            },
            oncreating: () => {
                if (this.oncreating) this.oncreating(this);
                if (this['intervention'] && this['intervention']['oncreating']) {
                    this['intervention']['oncreating'](this)
                }
            },
            preconfig: () => {
                if (this.preconfig) this.preconfig(this);
                if (this['intervention'] && this['intervention']['preconfig']) {
                    this['intervention']['preconfig'].call(this);
                    // if (this._.isMainComponent) {
                    //     if (this.controls.length > 0) { 
                    //         if (!this.controls[0]['intervention']) {
                    //             this.controls[0]['intervention'] = {
                    //                 preconfig:this['intervention']['preconfig']
                    //             }
                    //         } else { 
                    //             this.controls[0]['intervention']['preconfig'] = this['intervention']['preconfig'];
                    //         }
                    //     }
                    // } else { 
                    //     this['intervention']['preconfig'].call(this); 
                    // } 
                }

            }
        },
        methods: {
            addNodes: () => {
                if (this['nodes']) {
                    this['nodes'].forEach(element => {
                        if (element) { this.controls.add(element); }
                    });
                }
            },
            addSlots: () => {
                var slots = this._.methods.findSlotNodes(this);
                var namedSlot = false;
                // console.error(slots,this );
                if (slots && slots.length > 0) {
                    slots.forEach((x, isd) => {
                        
                        if (x.props && x.props.Name) {

                            var s = this['slots'].find(t => (t.attr.get('slot') === x.attr.get('name')));
                            if (s) {
                                s.attr.remove('slot')
                                x.controls.add(s);
                                namedSlot = true;
                            }
                        }
                    })

                    if (this['slots']) {
                        slots.forEach((x, isd) => {

                            if (!x.props || !x.props.Name) {
                                var s = this['slots'].filter(t => !t.attr.has('slot'));
                                if (s && s.length > 0) {
                                    s.forEach(y => {
                                        x.controls.add(y);
                                    })
                                    namedSlot = true;
                                }
                            }
                        })
                    }

                    // console.error('slots', this._.methods.findSlotNodes(this),this['slots']);
                }
                if (this.parent) {
                    //this.parent['_'].methods.addSlots();
                }
            },
            findSlotNodes: (comp: IControl<any>): IControl<any>[] => {
                var founds: IControl<any>[] = [];
                comp.controls.filter((x) => x.props && x.props['isSlot']).forEach(y => {
                    founds.push(y);
                    var si = comp['_'].methods.findSlotNodes(y);
                    if (si && si.length > 0) {
                        founds.push(...si)
                    }
                })
                return founds;
            },
            runSetup: () => {

                if (this.setup) {
                    this.setup.call(this);
                }
                if (this['intervention'] && this['intervention']['setup']) {
                    if (this._.isMainComponent) {
                        if (this.controls.length > 0) {
                            this.controls.forEach(c => {
                                if (!c['intervention']) {
                                    c['intervention'] = {
                                        setup: this['intervention']['setup']
                                    }
                                } else {
                                    c['intervention']['setup'] = this['intervention']['setup'];
                                }
                            })
                        }
                    } else {
                        this['intervention']['setup'].call(this);
                    }
                }
                this.context.extensions.forEach((x, y, z) => {
                    Reflect.ownKeys(x).forEach(t => {
                        if (x[t].componentInit) {
                            x[t].componentInit(this);
                        }
                    })
                });

            },
            waiterFr: document.createDocumentFragment(),
            waiterin: null as any,
            AppendElement: async (child) => {
                var index = 0;
                if (child['isStart']) {
                    child['isStart'] = false;
                    this._.methods.waiterFr.appendChild(child.element)
                    window.clearTimeout(this._.methods.waiterin);
                    var self = this;
                    this._.methods.waiterin = window.setTimeout(() => {
                        self.element?.parentElement?.insertBefore(this._.methods.waiterFr, self.element);
                    }, 1)
                } else {

                    if (child['insertTo'] !== null && child['insertTo'] !== undefined) {
                        index = child['insertTo'];
                    }
                    else if (child['toFirst'] !== null && child['toFirst'] !== undefined) {
                        index = 0;
                    }

                    if (this._.isMainComponent) {
                        if (!this.element.isConnected) {
                            this.parent["_"].methods.AppendElement(this)
                        }

                        if (this.element && this.element.parentElement && this.element.parentElement.childNodes) {
                            const array = Array.prototype.slice.call(this.element?.parentElement?.childNodes);
                            var ooLength = this.controls.filter(t => t.isRendered).length;
                            if (child['insertTo'] < 0) {
                                child['insertTo'] = 0;
                            }
                            var currentLength = (array.indexOf(this.element) - ooLength) + child['insertTo'];
                            var ref = array[currentLength];
                            if (!ref) {
                                ref = this.element;
                            }

                            this.element.parentElement?.insertBefore(child.element, ref);

                        }

                    } else {
                        var refElementb = this.element.childNodes.item(index)
                        if (refElementb === null) {
                            try {
                                this.element.appendChild(child.element);
                            } catch (error) {
                                console.error("MOVI:" + error, this, child)
                            }

                        } else {
                            if (this.isFragment) {
                                this.parent.controls.add(child.element);
                            } else {
                                try {
                                    if (this.element !== child.element) {
                                        this.element.appendChild(child.element);
                                    } else {
                                        this.element.insertBefore(child.element, refElementb);
                                    }

                                } catch (error) {
                                    console.warn('MOVI:', error);
                                }
                            }
                        }
                    }
                }
                //child.addEnterTransition();
                //await child.waitTransition('enter'); 

            },
            clearMainSubsicribers: null as any,
            addEnterTransition: async () => {
                var self = this;
                if (self.settings?.transition?.name && self.settings.transition.name !== '') {
                    var name = self.settings.transition.name;
                    self.class.remove([`${name}-leave`, `${name}-leave-end`])
                    self.class.add([`${name}-enter`, `${name}-enter-start`])
                }
            },
            addLeaveTransition: async () => {
                var self = this;
                if (self.settings?.transition?.name && self.settings.transition.name !== '') {
                    var name = self.settings.transition.name;
                    self.class.remove([`${name}-enter`, `${name}-enter-start`])
                    self.class.add([`${name}-leave`, `${name}-leave-end`])
                }
            },
            addMoveTransition: async () => {
                if (this.settings?.transition?.name && this.settings.transition.name !== '') {
                    var name = this.settings.transition.name;
                    this.class.remove([`${name}-enter`, `${name}-enter-start`, `${name}-leave`, `${name}-leave-end`])
                    this.class.add([`${name}-move`])
                    // await this.waitTransition();
                }
            },
            waitTransition: async (type: string) => {
                var self = this._.methods;
                if (this.settings?.transition?.name && this.settings.transition.name !== '' && type !== '') {
                    var name = this.settings.transition.name;
                    // var transitionInfo = getTransitionInfo(this.element as Element, `${name}-${type} ${name}-${type}-start`);

                    // if (transitionInfo.timeout) {

                    //     await self.delay(transitionInfo.timeout, () => {

                    //     });
                    // }

                    // if (self.settings?.transition?.name && self.settings.transition.name !== '') {
                    //     var name = self.settings.transition.name;
                    //     self.class.remove([`${name}-move`, `${name}-enter`, `${name}-enter-start`, `${name}-leave`, `${name}-leave-end`]);
                    // }
                }
            },
            _oldDelayer: null as any,
            delay: async (milliseconds, cb?: any) => {
                var self = this._.methods;

                window.clearTimeout(self._oldDelayer);
                return new Promise((resolve: any) => {
                    self._oldDelayer = window.setTimeout(() => {
                        resolve();
                        if (cb) { cb() }
                    }, milliseconds);
                });
            },
            remove: () => {
                if (this.element) {
                    if (this.element instanceof Text) {
                        this.element.remove();
                    }
                    else if (this.element instanceof Element) {
                        this.element.remove();
                    } else if (this.element instanceof DocumentFragment) {
                        this.element.firstChild?.remove();
                    } else if (this.element instanceof HTMLTemplateElement) {
                        this.element.content.firstChild?.remove();
                    } else {
                        this.element.remove();
                    }
                }
            }
        },
        tempContent: null as unknown as IControl<ElementTypes>,
        eventHandlers: new Collection<KeyValueItem>(),
        modelInstances: new Set<any>()
    }
    constructor(tag, props) {


        var self = this;
        if (this.context.extensions.size > 0) {
            var ref = {}
            this.context.extensions.forEach((x, y, z) => {
                delete x['props'];
                var clone = Object.assign({}, x);
                if (typeof clone === 'function') {
                    clone = clone.bind(self);
                }

                Reflect.ownKeys(clone).forEach(t => {
                    if (typeof clone[t] === 'function') {
                        clone[t] = clone[t].bind(self);
                    }
                });

                Reflect.ownKeys(clone).forEach(t => {
                    if (clone[t].run) {
                        clone[t].run(self);
                    }
                })
                //Object.assign(ref, clone);
                Object.assign(self, clone)
            }, this);

        }
        if (props !== undefined && props !== null) {
            Object.keys(props).forEach(k => {
                this[k] = props[k];
            })
            //Object.assign(this, props)
        };


        if (tag === undefined || tag === null) {
            this._.isMainComponent = true;
            this._.isContainer = true;
            this.element = document.createComment('REF#' + counter++) as any as ElementType; //document.createComment('ApplicationPlaceholder' + counter++) as ElementType;    
            // this.element = document.createTextNode(' ') as any as ElementType; 

        } else {
            this.element = tag;
        }




        this._.event.oncreating();
        this._.event.preconfig();



        if (this.onconfig) this.onconfig(this);
        if (this['intervention'] && this['intervention']['onconfig']) {
            this['intervention']['onconfig'] = this['intervention']['onconfig'].bind(this);
            this['intervention']['onconfig'].call(this);
        }

        this._.methods.clearMainSubsicribers = this.context.internal.subscribe('routeChanged', () => {
            if (this.onRouteChanged && !this.isDisposed) { this.onRouteChanged.call(this, this) }
        });

        this.controls.ItemAdded = (item) => {
            if (this.isRendered) {
                if (Array.isArray(item)) {
                    item.forEach(t => {
                        t['insertTo'] = this.controls.length - 1;
                        t.parent = this;
                        try {
                            t.build();
                        } catch (error) {
                            debugger
                        }
                    })
                } else {
                    item['insertTo'] = this.controls.length - 1;
                    item.parent = this;
                    try {
                        item.build();
                    } catch (error) {
                        debugger
                    }
                }
            }
        }
        this.controls.ItemAddedBefore = (item) => {
            if (this.isRendered) {
                item['insertTo'] = 0;
                item.parent = this;
                item.build();
            }
        }

        this.controls.ItemSplice = (index, item) => {
            if (this.isRendered) {
                item['insertTo'] = index;
                item.parent = this;
                item.build();
                //this._.methods.AppendElement(item);

            }
        }

        if (this.oncreated) this.oncreated(this);
        this._.instanced = true;
    }

    private _iswait: boolean = false;
    private get iswait(): boolean {
        if (this._iswait === true) {
            if (this.isRendered) {
                this.hide();
            }
        }
        return this._iswait;
    };
    private set iswait(v: boolean) {
        this._iswait = v;
        if (v === false) {
            this.build();
            this.show();
        } else {
            if (this.isRendered) {
                this.hide();
            }

        }
    }

    hook(a, b) {
        var self = this;
        if (a === 'router') {
            if (this.onRouteChanged) {
                this.onRouteChanged = this.onRouteChanged.bind(self);
                this.onRouteChanged(self);
            }
        }
    }
    public add(c: IControl<any>) {
        this.controls.add(c);
    }
    setText(value) {
        if (!this._.isMainComponent) {
            this.element.textContent = value;
        }
    }
    private _tempContent?: IControl<any>;
    setTempContent(control: IControl<any>) {
        this._tempContent = control;
        if (!control.isRendered) {
            control.build();
        }
        if (this._.isMainComponent) {
            this.element.parentElement?.replaceChild(this.element, control.element)
        } else {
            this.element.appendChild(control.element)
        }
    }


    bind: Directive = new Directive(this);
    isFragment: boolean = false;
    handleDispose(cb: () => any) {
        throw new Error("Method not implemented.");
    }
    context: IApplicationService = ApplicationService.current;
    controls: Collection<IControl<any>> = new Collection();
    private _parent: IControl<ElementTypes> = null as any;
    public get parent(): IControl<ElementTypes> {
        return this._parent;
    };
    public set parent(v: IControl<ElementTypes>) {
        this._parent = v;
        if (this.onmounted) { this.onmounted(this); }
    }
    element: ElementType = null as any;
    async build(target?: any) {


        if (this.props && this.props['container']) {

            var tb;
            if (typeof this.props['container'] === 'function') {
                tb = this.props['container']();
            } else {
                tb = this.props['container'];
            }
            if (typeof tb === 'string') {
                target = document.getElementsByTagName(tb)[0]
            } else if (tb instanceof Element) {
                target = tb;
            }
        }

        if (this.isRendered) {

            // if (this.props && this.props['BuildTo']) {
            //     console.error("render to target")
            // }
            this.controls.filter(t => t.isRendered === false || t.isRendered === undefined || t.isRendered === null).forEach((ts, index) => {
                if (Array.isArray(ts)) {
                    ts.forEach(tt => {
                        tt.parent = this;
                        try {
                            tt['insertTo'] = index;
                            tt.build();
                        } catch (error) {
                            console.error('Build Error', error);
                        }
                    })
                } else {
                    try {
                        ts['insertTo'] = index;
                        ts.parent = this;
                        ts.build();
                    } catch (error) {
                        console.error('Build Error', error);
                    }
                }

            })

            return;
        };


        const resume = async (self) => {


            if (self._.isInited == false && self['intervention'] && self['intervention']['preconfig']) {
                self['intervention']['preconfig'].call(self)
            }
            self._.isInited = true;

            if (self._.initializing.wait()) {
                return;
            };

            if (self.iswait) {
                return;
            }

            self._.event.onbuilding();
            self._.methods.addNodes();

            if (target) {
                target.append(self.element)
                // console.error('orjinale ekle', this.element)
            } else {
                if (self.parent) {
                    // const array = Array.prototype.slice.call(this.parent.element?.parentElement?.childNodes);
                    // var ooLength = this.parent.controls.filter(t => t.isRendered).length;
                    // var currentLength =   (array.indexOf(this.parent.element) - ooLength) + this['insertTo'];

                    // console.error('parent ekle',this.element,this.parent.element,array[currentLength],ooLength ,array.indexOf(this.parent.element))
                    self.parent['_'].methods.AppendElement(this);
                } else {
                    // console.error('parent yokki')
                }
            }


            var resume = true;



            if (self.view && !self._.viewInit) {
                self.view = self.view.bind(self);
                var item = self.view ? await self.view.call(self, self) : null as any;
                self._.viewInit = true;
                if (item != null) {
                    if (Array.isArray(item)) {
                        item.forEach(g => {
                            self.controls.add(g);
                        })
                    }
                    else if (item instanceof MoviComponent) {
                        if (item && item['nodes']) {
                            item['nodes'].forEach(element => {
                                if (element && element.element) {
                                    item && item.controls.add(element);
                                }
                            });
                        }

                        self.controls.add(item);
                    } else {

                        if (item.view) {
                            item.view = item.view.bind(self);
                        }

                        var itemA = self.view ? await self.view.call(self, self) : null;
                        if (Array.isArray(itemA)) {
                            itemA.forEach(g => {
                                self.controls.add(g);
                            })
                        } else if (itemA instanceof MoviComponent) {
                            if (itemA && itemA['nodes']) {
                                itemA['nodes'].forEach(element => {
                                    if (element && element.element) {
                                        item && item.controls.add(element);
                                    }
                                });
                            }
                            self.controls.add(item);
                        } else {
                            self.controls.add(item);
                        }
                    }
                    //if (self.onconfig) self.onconfig(self);
                    if (self._.initializing.wait()) return;

                    if (self.iswait) {
                        resume = false;
                        return;
                    }
                }

            }

            self._.methods.runSetup();

            if (self._.tempContent) { self._.tempContent.dispose() }

            self.controls.forEach((ts, index) => {

                if (Array.isArray(ts)) {
                    ts.forEach(tt => {
                        tt.parent = self;
                        try {
                            tt['insertTo'] = index;
                            tt.build();
                        } catch (error) {
                            console.error('Build Error', error);
                        }
                    })
                } else {
                    try {
                        ts['insertTo'] = index;
                        ts.parent = self;
                        ts.build();
                    } catch (error) {
                        console.error('Build Error', error);
                    }
                }



            })

            self.isRendered = true;
            self.bind.init();

            if (self.onbuilded) { self.onbuilded(this); }
            if (self['intervention'] && self['intervention']['onbuilded']) {
                self['intervention']['onbuilded'].call(self)
            }

            this._.methods.addSlots();

        }
        var selfMain = this;
        if (!this._.isInited) {
            if (this['interrupt']) {
                this['interrupt'](this, async function () {
                    if (self['intervention'] && self['intervention']['interrupt']) {
                        self['intervention']['interrupt'](self, async function () {
                            resume(selfMain)
                        })
                    } else {
                        resume(selfMain)
                    }
                })
            } else {
                resume(selfMain);
            }
        } else {
            resume(selfMain);
        }


    }

    wait(): IControl<ElementType> {
        throw new Error("Method not implemented.");
    }

    async dispose(external?: boolean | undefined) {


        if (this.isDisposed == true) { return; };

        if (this._.on) {
            this._.on.forEach(t => t());
            this._.on.clear();
        }


        if (this['ondisposing']) { this['ondisposing'](this); }
        if (this._.methods.clearMainSubsicribers) { this._.methods.clearMainSubsicribers(); }

        this.bind.dispose();

        var self = this;
        if (self['nodes']) {
            await self['nodes'].forEach(async c => {
                c.dispose();
            })
        }
        this._.methods.addLeaveTransition();
        await this._.methods.waitTransition('leave');


        if (!this.isDisposed) {
            this._.methods.remove();
            this.context.ControlCollection.delete(this);
            // if (this.parent) this.parent.controls.remove(this);

            self.controls._map.forEach(async control => {
                if (this._.isMainComponent || this.element instanceof Comment) {
                    control.dispose();

                } else {
                    control.flush();
                }
            })
            this.controls.clear();

            if (self.parent && !self.parent.isDisposed) {
                self.parent.controls.remove(self);
            }

            self.controls.clear();

            if (this.model) { this.context.clearModel(this.model); }
            this._.modelInstances.forEach(m => { this.context.clearModel(m) });
            system.GC(self);
            this.isDisposed = true;
        }

        if (this['ondisposed']) { this['ondisposed'](this); }
    }
    async flush() {

        if (this.isDisposed) { return; };
        this.bind.dispose();

        if (this._.on) {
            this._.on.forEach(t => t());
            this._.on.clear();
        }
        if (this._.methods.clearMainSubsicribers) { this._.methods.clearMainSubsicribers(); }

        this.controls.forEach(async control => {
            if (Array.isArray(control)) {
                await control.forEach(async t => {
                    t.flush();
                })
            } else {
                control.flush();
            }

        })
        var self = this;
        if (self.parent) this.context.ControlCollection.delete(this);

        if (self.parent && !self.parent.isDisposed) {
            //self.parent.controls.remove(self);
        }
        self.controls.clear();
        //if (this.parent) this.parent.controls.remove(this);

        if (this.model) { this.context.clearModel(this.model); }
        this._.modelInstances.forEach(m => { this.context.clearModel(m) });

        system.GC(this);
        this.isDisposed = true;
    }
    async clear(): Promise<any> {
        return new Promise((resolveOuter: any) => {
            this.controls.forEach(async (control, index) => {
                await control.dispose();
                this.controls.clear();
                if (index === this.controls.length - 1) {

                    window.setTimeout(resolveOuter, 0);
                }
            })
        });


    }
    async show() {
        if (this._.isMainComponent) {
            this.controls.forEach(c => {
                c.show();
            })
        } else {
            this._.methods.addEnterTransition();
            this._.methods.waitTransition('enter');

            if (this.isRendered && this._.isHidden == true) {
                this._.isHidden = false;

                if (this._.replacedHidden && !this.parent) {
                    document.body.appendChild(this.element);
                } else {
                    if (!this.parent || this.parent.element == null) {
                        document.body.replaceChild(this.element, this._.placeholder);
                    } else if (this._.placeholder.parentNode) {
                        this._.placeholder.parentNode.replaceChild(this.element, this._.placeholder);
                    }
                }
                this._.methods.addEnterTransition();
                this._.methods.waitTransition('enter');
            } else {
                this._.isHidden = false;
            }
        }


    }
    async hide() {

        // this.addLeaveTransition();
        // await this.waitTransition('leave');

        if (this._.isMainComponent) {
            this.controls.forEach(c => { c.hide() })
        } else {
            if (this.isRendered && this._.isHidden == false) {
                this._.isHidden = true;
                this._.methods.addLeaveTransition();
                await this._.methods.waitTransition('leave');
                if (!this.parent || !this.parent.element) {
                    document.body.replaceChild(this._.placeholder, this.element);
                } else if (this.element.parentNode != undefined) {
                    this.element.parentNode.replaceChild(this._.placeholder, this.element);
                }
            } else {
                this._.replacedHidden = true;
                this._.isHidden = true;
                this.element.parentNode?.replaceChild(this._.placeholder, this.element);
            }

        }


    }
    on(eventName: string | symbol, cb: (...args: any[]) => any, ...initialValues: any[]) {
        this._.on.add(this.context.on(eventName, cb));
        if (initialValues.length > 0) cb(...initialValues)
    }

    addHandler(event: string, callback: (sender: IControl<ElementType>, e: Event) => any): IControl<ElementType> {
        if (this.element === null || this.element === undefined) {
            return this
        }
        var xname = event.trim();
        var sender = this;
        xname.split(" ").forEach(eventName => {
            var spliter = ".";
            if (eventName.indexOf("-") > -1) {
                spliter = "-";
            } else if (eventName.indexOf(":") > -1) {
                spliter = ":";
            }
            var splt = eventName.split(spliter);
            const event = {
                key: splt[0],
                options: {
                    once: false,
                    capture: false,
                    passive: false,
                    prevent: false,
                    stop: false,
                    trusted: false,
                    self: false,
                },

                value: (ev: Event | any) => {


                    if (event.options.trusted === true && !ev.isTrusted) {
                        return;
                    }
                    if (event.options.self) {
                        if ((ev as Event).target !== sender.element) {
                            return;
                        }
                    }

                    if (splt.length > 1 && ev instanceof KeyboardEvent) {
                        if (ev['key']?.toLowerCase() == splt[1].toLowerCase()) {
                            if (event.options.prevent === true) {
                                ev.preventDefault();
                            }
                            if (event.options.stop === true) {
                                ev.stopPropagation();
                            }
                            callback(sender, ev)
                        }
                    }
                    else {
                        if (event.options.prevent === true) {
                            ev.preventDefault();
                        }
                        if (event.options.stop === true) {
                            ev.stopPropagation();
                        }
                        callback(sender, ev)
                    }
                }
            };

            for (let index = 2; index <= splt.length; index++) {
                const element = splt[index];
                switch (element) {
                    case 'once':
                        event.options.once = true;
                        break;
                    case 'passive':
                        event.options.passive = true;
                        break;
                    case 'prevent':
                        event.options.prevent = true;
                        break;
                    case 'stop':
                        event.options.stop = true;
                        break;
                    case 'trusted':
                        event.options.trusted = true;
                        break;
                    default:
                        break;
                }
            }

            this._.eventHandlers.add(event);
            try {
                this.element.addEventListener(event.key, event.value, event.options)
            } catch (err) {
                console.error(this);
                debugger
            }


        });
        return this;
    }
    removeHandler(event: string): IControl<ElementType> {
        var xname = event.trim();
        xname.split(" ").forEach(eventName => {
            var spliter = ".";
            if (eventName.indexOf("-") > -1) {
                spliter = "-";
            } else if (eventName.indexOf(":") > -1) {
                spliter = ":";
            }
            var splt = eventName.split(spliter);
            var i = this._.eventHandlers.find(x => x.key == splt[0]);
            if (i != null) {
                this._.eventHandlers.remove(i);
            }
        });
        return this;
    }

    attr: controlAttribute<ElementType> = new controlAttribute(this);
    class: IClass<ElementType> = new controlClass(this) as any as IClass<ElementType>;
    isRendered: boolean = false;
    isDisposed: boolean = false;
    isConnected: boolean = false;
    style(properties: styleKeys): IControl<ElementType> {
        if (this.element instanceof HTMLElement) {
            Object.entries(properties).forEach(t => {
                (this.element as any).style[toKebab(t[0])] = t[1];
            });
        }
        return this;
    };

    autostyle: controlStyle<ElementType> = new controlStyle(this);
    view?(context: MoviComponent<any, any>): MoviComponent<any, any>;

    using<T>(waitable: Promise<any>, onfulfilled?: ((value: T) => T | PromiseLike<T>) | undefined | null, onrejected?: ((reason: any) => never | PromiseLike<never>) | undefined | null) {
        waitable.then(
            (value: T) => { this && !this.isDisposed && onfulfilled ? onfulfilled(value) : ''; },
            (reason: any) => { this && !this.isDisposed && onrejected ? onrejected(reason) : '' });
    }

    registerStyle(style: any): IControl<ElementType> {
        throw new Error("Method not implemented.");
    }
    settings?: { isFrame?: boolean | undefined; keepAlive?: boolean | undefined; jump?: boolean | undefined; transition?: { name?: string | undefined; } | undefined; } | undefined;
    private _model?: any;
    public get model(): any {
        if (!this.isDisposed && this.context && this.context.useModel !== undefined) {
            return this.context.useModel(this._model)
        } else {
            console.warn(this)
        }
    }
    public set model(d: any) {
        this._model = this.context.useModel(d)
    }

    useModel<T extends object>(model: T): UnwrapNestedRefs<T>
    useModel(model: object) {
        var m = this.context.useModel(model);
        this._.modelInstances.add(m);
        return m;
    }

    setup?(): void;
    activated?(sender: IControl<any>): void;
    activating?(sender: IControl<any>): void;
    routeChanged?(sender: IControl<any>): void;
    onRouteChanged?(sender: IControl<any>): void;
    interrupt?(sender: IControl<any>, next: () => any): void;
    onconfig?(sender: IControl<any>): void;
    preconfig?(sender: IControl<any>): void;
    oncreating?(sender: IControl<any>): void;
    oncreated?(sender: IControl<any>): void;
    onbuilding?(sender: IControl<any>): IControl<ElementType>;
    onbuilded?(sender: IControl<any>): IControl<ElementType>;
    ondisposing?(sender: IControl<any>): IControl<ElementType>;
    ondisposed?(sender: IControl<any>): void;
    reload?: (() => IControl<any>) | undefined;
    onmounted?(sender): void;
}
