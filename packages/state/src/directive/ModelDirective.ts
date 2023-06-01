import { bindEffect, pauseTracking, resetTracking } from "../core/effect";
import { Bindable } from "../core/ReactiveEffect";
import { IControl } from "../../../movi/src/abstractions";
import { IDirective } from "../../../movi/src/abstractions/IDirective";

export class ModelDirectiveSettings {
    public Property!: any;
    public FieldName!: string;
    public callback!: () => any;
    public type: "function" | "expression" = "function";
    public oldValue: any;
}

export class ModelDirective implements IDirective<ModelDirectiveSettings>{
    id: any = null as any;
    isArray: boolean = false;
    fx: Bindable<any> = null as any;
    setupCompleted: boolean = false;
    constructor() {
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);


    }
    setup(target, key) {


        pauseTracking()
        this._settings.Property = target;
        this._settings.FieldName = key;
        resetTracking();
        
    }
    start() {

        if (this._settings == null) { return }
        if (this.setupCompleted) { return this.update() }

        switch (this._settings.type) {
            case "expression":
                if (this._settings.Property && this._settings.FieldName) {
                    this._settings.callback = () => {
                        var val = (this._settings.Property as any)[this._settings.FieldName];
                        return val;
                    }
                    this._settings.oldValue = this._settings.callback();
                }
                break;
            case "function":
                this._settings.oldValue = this._settings.callback();
                break;
            default:
                break;
        }
        var tn = '';
        if (this._source.element) {
            tn = (this._source.element as HTMLElement).tagName;
        }
        if (this._settings.oldValue == undefined || this._settings.oldValue == null) {
            return;
        }

        switch (tn) {
            case 'select': case 'SELECT':
                var select = <HTMLSelectElement>this._source.element;

                if (this._settings.oldValue !== undefined || this._settings.oldValue !== null) {
                    select.value = this._settings.oldValue;
                }
                this._source.addHandler("change", (sender, e) => {
                    if (this._settings.oldValue != select.value) {
                        this._settings.Property[this._settings.FieldName] = select.value as unknown as any;
                        this._settings.oldValue = select.value;
                    }
                });
                break;
            default:
                var ii = (this._source.element as unknown as HTMLInputElement);
                if (ii.type == 'checkbox' || ii.type == 'radio') {
                    var Select = (this._source.element as unknown as HTMLInputElement);

                    if (this._settings.oldValue !== undefined || this._settings.oldValue !== null) {
                        Select.checked = this._settings.oldValue;
                    } else {
                        Select.checked = false;
                    }

                    this._source.addHandler("input", (sender: IControl<any>, e: Event) => {

                        var nval = (e as any).target.checked;
                        this._settings.Property[this._settings.FieldName] = nval;
                        this._settings.oldValue = nval;
                    })
                } else {
                    if (this._settings.oldValue !== undefined || this._settings.oldValue !== null) {
                        (this._source.element as unknown as HTMLInputElement).value = this._settings.oldValue;
                    }

                    this._source.addHandler("input", (sender: IControl<any>, e: Event) => {
                        var nval = (e.target as HTMLInputElement).value as any;
                        if (this._settings.oldValue != nval) {
                            if (typeof this._settings.oldValue === 'number' || typeof nval === 'number') {
                                nval = parseFloat(nval);
                            }   
                            this._settings.Property[this._settings.FieldName] = nval;
                            this._settings.oldValue = nval;
                        }
                    })
                }
                break;
        }
        this.setupCompleted = true;
    }
    update() {

        if (this._settings == null) { return }
        if (!this.setupCompleted) { return this.setupCompleted }
        //Source.element.textContent = settings.callback(); 
        var nv = this._settings.callback();
        if (nv === undefined || nv === null) {
            return;
        }
        if (this._source.isDisposed || this._source.element === null) { return }
        switch ((this._source.element as HTMLElement).tagName) {
            case 'input': case 'INPUT':
                var ii = (this._source.element as unknown as HTMLInputElement);
                if (ii.type == 'checkbox' || ii.type == 'radio') {
                    if (typeof this._settings.Property[this._settings.FieldName] === 'boolean') {
                        (this._source.element as unknown as HTMLInputElement).checked = nv;
                    } else {
                        (this._source.element as unknown as HTMLInputElement).checked = false;
                        (this._source.element as unknown as HTMLInputElement).value = nv;
                    }
 

                } else {
                    (this._source.element as unknown as HTMLInputElement).value = nv;
                }


                break;
            case 'button': case 'BUTTON':
                var se = <any>this._source.element;
                se.value = nv;
                break;
            case 'select': case 'SELECT':
                (this._source.element as unknown as HTMLSelectElement).value = nv;
                break;
            case 'option': case 'OPTION':
                (this._source.element as unknown as HTMLOptionElement).value = nv;
                break;
            default:
                (this._source.element as any).value = nv;
                break;
        }

    }
    private _settings: ModelDirectiveSettings = null as any;
    private _source: IControl<any> = null as any;

    init(settings: ModelDirectiveSettings, Source: IControl<any>): void {
        if (settings == null) { return }
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this); 
        this.fx = bindEffect(this).effect; 
    }


    dispose(settings: ModelDirectiveSettings, Source: IControl<any>) {
        if (settings == null) { return }
        if (Source.isDisposed || Source.element === null) { return }

        if (this.fx) {
            this.fx.stop(settings.Property, settings.FieldName);
            this.fx.remove(Source.model);
        }
        this._source = null as any;
        this._settings = null as any;
        this.fx = null as any;
        this.setupCompleted = null as any;
    }

}