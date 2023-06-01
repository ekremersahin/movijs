

import { IControl } from "../../../movi/src/abstractions";
import { IDirective } from "../../../movi/src/abstractions/IDirective";
import { bindEffect,  pauseTracking, resetTracking  } from "../core/effect";
import { Bindable } from "../core/ReactiveEffect";
import { convert } from "../methods"; 

export class LoopDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: "function" | "expression" = "function";
    public oldValue: any;
    render?(data: any, index?): IControl<any>;
    public fragment: IControl<any> = null as any;
}

export class LoopDirective implements IDirective<LoopDirectiveSettings>{
    id: any = null as any;
    isArray: boolean = true;
    oldCollection: any[] = [];
    collection: any[] = [];
    settings!: LoopDirectiveSettings;
    arg: any;
    fx: Bindable<any> = null as any;
    private _settings: LoopDirectiveSettings = null as any;
    private _source: IControl<any> = null as any
    constructor() {
        this.updateAsync = this.updateAsync.bind(this);
        this.push = this.push.bind(this);
    }
    private inits = false;
    start(key?) {
        var setf = this;
        if (this._settings == null) { return }
        if (this.inits) {
            return this.update(key);
        }
        this.inits = true;
        switch (this._settings.type) {
            case "expression":
                if (this._settings.Property && this._settings.FieldName) {
                    this._settings.callback = () => {
                        var val = (this._settings.Property as any)[this._settings.FieldName];
                        return val;
                    }
                    this._settings.oldValue = this._settings.callback();
                    //this.fx.oldValue = this._settings.oldValue; 
                }
                break;
            case "function":
                this._settings.oldValue = this._settings.callback();
                break;
            default:
                break;
        }

        if (typeof this._settings.oldValue === 'function') {
            this._settings.oldValue = this._settings.oldValue();
        }

        this._settings.oldValue.forEach((t: any, i: any) => {
            var elm = this.build(t, i);
            elm['index'] = i;
            elm['isStart'] = true;
            this._source.controls.insert(i, elm)
        })

    }

    private wm = new Map();
    private lastTimer;
    update(key?) {
        var self = this; 
         self.updateAsync.call(self, key);

    }
    async updateAsync(key?) {

        var settings = this._settings;
        var Source = this._source;

        if (Source.isDisposed) {
            if (this.fx) {
                this.fx.stop(settings.Property, settings.FieldName);
            }
            await this.dispose(settings, Source);
            return;
        }

        if (settings == null) { return }
        if (Source.isDisposed || Source.element === null) { return }

        var items = settings.callback();
        if (typeof items === "function") {
            items = items();
        }

        if (Array.isArray(items) && items.length == 0) {
            this.wm.clear();
            await this._source.clear();
        } else if (items === null || items === undefined) {
            this.wm.clear();
            await this._source.clear();
        } else if (key === 'modify') {
            this.wm.clear();
            // await this._source.clear();
            this._source.controls.forEach(t => {
                t.dispose();
            })
 
            items.forEach((t: any, i: any) => { 
                var elm = this.build(t, i);
                elm['index'] = i;
                elm['isStart'] = true;
                this._source.controls.insert(i, elm)
            })
        }


        pauseTracking()
        if (Array.isArray(items)) {
            let difference = this._source.controls.filter(x => !items.includes(x.__key__));
            await difference.forEach(async d => { 
                this.wm.delete(d.__key__);
                await d.dispose();
            })
        } else { 
            
        }
     
        resetTracking()

        if (Source.isDisposed) {
            if (this.fx) {
                this.fx.stop(settings.Property, settings.FieldName);
            }
            this.wm.clear();
            await this.dispose(settings, Source);
            return;
        }

        var isStart = false;
        if (this._settings.oldValue.length == 0) {
            isStart = true;
        }
        if (items) {

          
            if (key === 'modify') {

               

            } else {

                items.forEach(async (item, index) => {
                    //console.error('forEach')
                    if (typeof item !== "undefined") {
                        if (Source.isDisposed) {
                            if (this.fx) {
                                this.fx.stop(settings.Property, settings.FieldName);
                            }
                            await this.dispose(settings, Source);

                            return;
                        } 
                        if (!this.wm.has(item)) {
                            var elm = this.build(item, index);
                            elm['index'] = index;
                            elm['isStart'] = isStart;
                            Source.controls.insert(index, elm)
                        } else {
                            var exist = this.wm.get(item);
                            if (key === 'modify') {

                                exist.element.remove();
                                Source.controls.remove(exist);
                                Source.controls.insert(index, exist)
                            } else {
                                exist.index = index;
                                
                            }
                        }
                    }
                })
            }

        }



        pauseTracking();
        this._settings.oldValue = items;
        resetTracking();
        return

    }
    setupCompleted = false;
    setup(target, key) {

        if (this._source.isDisposed) {
            if (this.fx) {
                this.fx.stop(this._settings.Property, this._settings.FieldName);
            }
            this.dispose(this._settings, this._source);
            return;
        }

        pauseTracking() 
        this._settings.Property = target;
        this._settings.FieldName = key;
        resetTracking();
    }


    init(settings: LoopDirectiveSettings, Source: IControl<any>): void {


        this._settings = settings;

        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        
        this.fx = bindEffect(this).effect; 
    }
    async push(val) {

        var settings = this._settings;
        var Source = this._source;

        if (Source.isDisposed) {
            if (this.fx) {
                this.fx.stop(settings.Property, settings.FieldName);
            }
            await this.dispose(settings, Source);
            return;
        }

        if (settings == null) { return }
        if (Source.isDisposed || Source.element === null) { return }

        var items = settings.callback();
        items.forEach((item, index) => {
            if (!this.wm.has(item)) {
                var elm = this.build(item, index);
                elm['index'] = index;
                elm['isStart'] = false;
                Source.controls.insert(index, elm)
            }
        })
   
    }
  
    build(data: any, index: any) {

        var elm = this._settings.render!(data, index);
        var raw = convert.toRaw(data);
        pauseTracking();
        this.wm.set(data, elm);
        (elm as any)['index'] = index;
        (elm as any)['__key__'] = data;
        resetTracking();
        return elm;
    }
    dispose(settings: LoopDirectiveSettings, Source: IControl<any>) {
        if (settings == null) { return }
        if (Source.isDisposed || Source.element === null) { return }
        if (!settings.Property) { return }

        this.wm.clear();
        if (this.fx) {
            this.fx.stop(settings.Property, settings.FieldName);
            this.fx.remove(Source.model);
        }
        this.fx = null as any;
        this._source = null as any;
        this._settings = null as any;
        //Shared.bindMap.delete(this);
    }

    async splice(val) {
        if (val) {  
            val.forEach(t => {  
                if (this.wm.has(t)) { 
                    var c = this.wm.get(t);
                    if (c && !c.isDisposed) { 
                        c.dispose();
                        this.wm.delete(t);
                    }
                }
            }) 
        }
         
     }
}