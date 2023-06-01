
import { IControl } from "../../../movi/src/abstractions"; 
import { IDirective } from "../../../movi/src/abstractions/IDirective";
import { bindEffect,  pauseTracking, resetTracking } from "../core/effect";
import { Bindable } from "../core/ReactiveEffect";

export class EffectDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: "function" | "expression" = "function";

}

export class EffectDirective implements IDirective<EffectDirectiveSettings>{
    id: any;
    isArray: boolean = false;
    fx: Bindable<any> = null as any;
    private _settings: EffectDirectiveSettings = null as any;
    private _source: IControl<any> = null as any;

    start() {
        if (this._settings == null) { return }
        this._settings.callback.call(this._source);
    }

    update() {
        if (this._settings == null) { return }
        if (this._source.isDisposed || this._source.element === null) { return }
       
        this._settings.callback.call(this._source);
    }
    setup(target, key) { 
        pauseTracking() 
        this._settings.Property = target;
        this._settings.FieldName = key;
        resetTracking();
    }
    init(settings: EffectDirectiveSettings, Source: IControl<any>): void {
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this); 
        this.fx = bindEffect(this).effect; 
    }
      dispose(settings: EffectDirectiveSettings, Source: IControl<any>)  {

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