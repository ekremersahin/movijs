
import { bindEffect,  pauseTracking, resetTracking } from "../core/effect";
import { Bindable } from "../core/ReactiveEffect";
import { IControl } from "../../../movi/src/abstractions";
import { IDirective } from "../../../movi/src/abstractions/IDirective";

export class HtmlDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: "function" | "expression" = "function";

}

export class HtmlDirective implements IDirective<HtmlDirectiveSettings>{
    id: any = null as any;
    isArray: boolean = false;
    fx: Bindable<any> = null as any;
    private _settings: HtmlDirectiveSettings = null as any;
    private _source: IControl<any> = null as any;

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
                    if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
                        val = this._settings.callback();
                    } else {
                        val = this._settings.callback();
                    }
                }
                break;
            case "function":
                if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
                    val = this._settings.callback();
                } else {
                    val = this._settings.callback();
                }
                break;
            default:
                break;
        }
        if (typeof val === 'function') {
            val = val();
        }
        if (val === undefined || val === null) {
            val = '';
        }
        if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
            this._source.element.innerHTML = val;
        } else {
            this._source.element.textContent = val;
        }
    }

    update() {
        if (this._settings == null) { return }
        var val = this._settings.callback();
        if (this._source.isDisposed || this._source.element === null) { return }
        if (val === undefined || val === null) {
            val = '';
        }
        if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
            this._source.element.innerHTML = val;
        } else {
            this._source.element.textContent = val;
        }

    }
    setup(target, key) {
        pauseTracking() 
        this._settings.Property = target;
        this._settings.FieldName = key;
        resetTracking();
    }
    init(settings: HtmlDirectiveSettings, Source: IControl<any>): void {
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this); 
        this.fx = bindEffect(this).effect; 
    }
    dispose(settings: HtmlDirectiveSettings, Source: IControl<any>) {

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