import { bindEffect,  pauseTracking, resetTracking } from "../core/effect";
import { Bindable } from "../core/ReactiveEffect";
import { IControl } from "../../../movi/src/abstractions"; 
import { IDirective } from "../../../movi/src/abstractions/IDirective";

export class ReloadSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: "function" | "expression" = "function";

}

export class ReloadDirective implements IDirective<ReloadSettings>{
    id: any = null as any;
    isArray: boolean = false;
    fx: Bindable<any>= null as any;
    private _settings: ReloadSettings= null as any;
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
        } else if (Array.isArray(val)) {
            if (val != null) { 
                if (val.length > 0) {
                    r = true;
                } else {
                    r = false;
                } 
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
           if(this._source.reload) this._source.reload(); 
        } 
    }

    update() {

    }
    setup(target, key) { 
        pauseTracking() 
        this._settings.Property = target;
        this._settings.FieldName = key;
        resetTracking();
    }
    init(settings: ReloadSettings, Source: IControl<any>): void {
        if (settings == null) { return }
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.fx = bindEffect(this).effect; 
    }

    async dispose(settings: ReloadSettings, Source: IControl<any>) {

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