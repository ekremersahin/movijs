import { bindEffect,  pauseTracking, resetTracking } from "../core/effect"; 
import { IControl } from "../../../movi/src/abstractions";
import { IDirective } from "../../../movi/src/abstractions/IDirective";
import { Bindable } from "../core/ReactiveEffect";

export class AttributeHandlingSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: "function" | "expression" = "function";
    public attributes: Set<string> = new Set();
}

export class AttributeHandlingDirective implements IDirective<AttributeHandlingSettings>{
    id: any = null as any;
    isArray: boolean = false;
    fx: Bindable<any>= null as any;
    private _settings: AttributeHandlingSettings= null as any;
    private _source: IControl<any>= null as any;
    constructor() {



    }
    start() {
       
        if (this._settings == null) { return }
        var val;
        switch (this._settings.type) {
            case "expression":
                if (this._settings.Property && this._settings.FieldName) {
                    this._settings.callback = () => {
                        var val = (this._settings.Property as any)[this._settings.FieldName];
                        return val;
                    }
                    val = this._settings.callback();
                }
                break;
            case "function":
                val = this._settings.callback();
                break;
            default:
                break;
        }
        if (typeof val === 'function') {
            val = val();
        }
        var r = false;

        if (typeof val === 'number') {
            r = val > 0;
        } else if (typeof val === 'boolean') {
            r = val;
        } else if (val === undefined) {
            r = false;
        } else if (typeof val === "string") {
          
            if (val.length > 0) {
                r = true;
            } else {
                r = false;
            }
        } else if (typeof val === 'object') {
            if (val != null) {

                if (Object.keys(val).length > 0) {
                    r = true;
                } else {
                    r = false;
                }

            } else {
                r = false;
            }
        } else if (val == null) {
            r = false;
        }
        if (r === true) {
            this._settings.attributes.forEach(atr => {
                if (this._source.element[atr]) this._source.element[atr]();
            })
        }
    }

    update() {
       console.error('Update')
    }
    setup(target, key) {
        pauseTracking() 
        this._settings.Property = target;
        this._settings.FieldName = key;
        resetTracking();
    }
    init(settings: AttributeHandlingSettings, Source: IControl<any>): void {
        if (settings == null) { return }
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.fx = bindEffect(this).effect;
        //this.fx = effect(this.start, this.setup).effect;
    }

     dispose(settings: AttributeHandlingSettings, Source: IControl<any>)  {

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