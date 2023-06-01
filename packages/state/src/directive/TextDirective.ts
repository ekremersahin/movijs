import { bindEffect,  pauseTracking, resetTracking } from "../core/effect";
import { Bindable } from "../core/ReactiveEffect";
import { IControl } from "../../../movi/src/abstractions";
import { IDirective } from "../../../movi/src/abstractions/IDirective";

export class TextDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: "function" | "expression" = "function";

}

export class TextDirective implements IDirective<TextDirectiveSettings>{
    id: any = null as any;
    isArray: boolean = false;
    fx: Bindable<any> = null as any;
    private _settings: TextDirectiveSettings = null as any;
    private _source: IControl<any> = null as any;
    constructor() {


    }
    start() {
        if (this._settings == null) { return }
        var content;
        switch (this._settings.type) {
            case "expression":
                if (this._settings.Property && this._settings.FieldName) {
                    this._settings.callback = () => {
                        var val = (this._settings.Property as any)[this._settings.FieldName];
                        return val;
                    }
                    if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
                        content = this._settings.callback();
                    } else {
                        content = this._settings.callback();
                    }

                }
                break;
            case "function":
                if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
                    content = this._settings.callback();
                } else {
                    content = this._settings.callback();
                }
                break;
            default:
                break;
        }
        if (typeof content === 'function') {
            content = content();
        }
        
        if (Array.isArray(content)) {
            var arrayToString = '';
            content.forEach(tx => { 
                arrayToString = `${arrayToString} ${tx}`
            })
            this._source.element.textContent = arrayToString;
        } else if (typeof content === 'object') {
            var objectToString = '';
           Object.keys(content).forEach(tx => { 
                objectToString = `${objectToString} ${content[tx]}`
            })
            this._source.element.textContent = objectToString;
        } else {
            
            if (content === undefined || content === null) {
                content = '';
            }

            this._source.element.textContent = content;
        }
        //
    }

    update() {
        
        if (this._settings == null) { return }
        if (this._source.isDisposed || this._source.element === null) { return }
        var val = this._settings.callback();
        if (val === undefined || val === null) {
            val = '';
        }
        if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {

            this._source.element.textContent = val;
        } else {
            this._source.element.textContent = this._settings.callback();
        }
    }
    setup(target, key) {
        pauseTracking() 
        this._settings.Property = target;
        this._settings.FieldName = key;
        resetTracking();
    }
    init(settings: TextDirectiveSettings, Source: IControl<any>): void {
        if (settings == null) { return }
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this); 
        this.fx = bindEffect(this).effect; 
    }

    async dispose(settings: TextDirectiveSettings, Source: IControl<any>) {

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