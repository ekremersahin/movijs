
import { Component } from "../../../movi/src";
import { IControl } from "../../../movi/src/abstractions"; 
import { IDirective } from "../../../movi/src/abstractions/IDirective";
import { bindEffect,  pauseTracking, resetTracking } from "../core/effect";
import { Bindable } from "../core/ReactiveEffect";

export class LogicDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: (val:any) => any;
    public logicalFn!: () => any;
    public type: "function" | "expression" = "function";

}

export class LogicDirective implements IDirective<LogicDirectiveSettings>{
    id: any;
    isArray: boolean = false;
    fx: Bindable<any> = null as any;
    private _settings: LogicDirectiveSettings = null as any;
    private _source: IControl<any> = null as any;
    private _prevControl: IControl<any>;
    start() {
        if (this._settings == null) { return }
        var val = this._settings.logicalFn();
     
        if (this._prevControl != null) {
            if (typeof val === 'boolean') {
                if (val) {
                    var pi = this._source.controls.indexOf(this._prevControl);
                    this._prevControl.dispose();
                    this._prevControl = this._settings.callback(val);  
                    if (this._prevControl === undefined || this._prevControl === null) { 
                        this._prevControl = new Component(document.createComment(''), {}) ; 
                    }
                    this._source.controls.insert(pi,this._prevControl);
                } else { 
                    var pi = this._source.controls.indexOf(this._prevControl);
                    this._prevControl.dispose();
                    this._prevControl = new Component(document.createComment(''), {}) ; 
                    this._source.controls.insert(pi,this._prevControl); 
                }
    
            } else { 
                var pi = this._source.controls.indexOf(this._prevControl);
                this._prevControl.dispose();
                this._prevControl = this._settings.callback(val); 
                if (this._prevControl === undefined || this._prevControl === null) { 
                    this._prevControl = new Component(document.createComment(''), {}) ; 
                }
                this._source.controls.insert(pi,this._prevControl); 
            }

        } else { 
            if (typeof val === 'boolean') { 
                this._prevControl =  new Component(document.createComment(''), {}) ; 
                this._source.controls.add(this._prevControl); 
            } else { 
                
                this._prevControl = this._settings.callback(val);
                 
                if (this._prevControl === undefined || this._prevControl === null) { 
                    this._prevControl = new Component(document.createComment(''), {}) ; 
                }
                this._source.controls.add(this._prevControl); 

            }
            

        }
 
    }

    update() { 
        if (this._settings == null) { return }
        if (this._source.isDisposed || this._source.element === null) { return }
        var val = this._settings.logicalFn();
       
        if (typeof val === 'boolean') {
            if (val) {
                var pi = this._source.controls.indexOf(this._prevControl);
                this._prevControl.dispose();
                this._prevControl = this._settings.callback(val); 
                if (this._prevControl === undefined || this._prevControl === null) { 
                    this._prevControl = new Component(document.createComment(''), {}) ; 
                }
                this._source.controls.insert(pi,this._prevControl);
            } else { 
                var pi = this._source.controls.indexOf(this._prevControl);
                this._prevControl.dispose();
                this._prevControl = new Component(document.createComment(''), {}) ; 
                this._source.controls.insert(pi,this._prevControl); 
            }

        } else { 
            var pi = this._source.controls.indexOf(this._prevControl);
            this._prevControl.dispose();
            this._prevControl = this._settings.callback(val); 
            
            if (this._prevControl === undefined || this._prevControl === null) { 
                this._prevControl = new Component(document.createComment(''), {}) ; 
            }
            this._source.controls.insert(pi,this._prevControl); 
        }
        
        

    }
    setup(target, key) { 
        pauseTracking() 
        this._settings.Property = target;
        this._settings.FieldName = key;
        resetTracking();
    }
    init(settings: LogicDirectiveSettings, Source: IControl<any>): void {
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this); 
        this.fx = bindEffect(this).effect; 
    }
      dispose(settings: LogicDirectiveSettings, Source: IControl<any>) {

        if (settings == null) { return }
        if (Source.isDisposed || Source.element === null) { return }

        if (this.fx) {
            this.fx.stop(settings.Property, settings.FieldName);
            this.fx.remove(Source.model);
        }
        this.fx = null as any;
        this._source = null as any;
        this._settings = null as any;
    }

}