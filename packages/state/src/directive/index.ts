
import { Component } from "../../../movi/src/Component";
import { IControl } from "../../../movi/src/abstractions";
import { EffectDirective, EffectDirectiveSettings } from "./effectDirective";
import { HtmlDirective, HtmlDirectiveSettings } from "./HtmlDirective";
import { LoopDirective, LoopDirectiveSettings } from "./LoopDirective";
import { ModelDirective, ModelDirectiveSettings } from "./ModelDirective";
import { ReloadDirective, ReloadSettings } from "./reloadDirective";
import { TextDirective, TextDirectiveSettings } from "./TextDirective";
import { ValueDirective, ValueDirectiveSettings } from "./ValueDirective";
import { VisibilityDirective, VisibilitySettings } from "./VisiblityDirective";
import { WaitDirective, WaitSettings } from "./waitDirective";
import { AttributeHandlingDirective, AttributeHandlingSettings } from "./AttributeHandling";
import { LogicDirective, LogicDirectiveSettings } from "./logicDirective";
import { MoviComponent } from "../../../movi/src";
export class Directive {
    public textDirective: TextDirective | undefined;
    public htmlDirective: HtmlDirective | undefined;
    public modelDirective: ModelDirective | undefined;
    public loopDirective: LoopDirective | undefined;
    public effectDirective: EffectDirective | undefined;
    public valueDirective: ValueDirective | undefined;
    public displayDirective: VisibilityDirective | undefined;
    public relloadDirective: ReloadDirective | undefined;
    public waitDirective: WaitDirective | undefined;
    public logicDirective: LogicDirective | undefined;
    public attributeDirectives: Map<AttributeHandlingSettings, AttributeHandlingDirective> = new Map();
    constructor(public owner: IControl<any>) {
       
    }


    public Configuration = {
        TextSettings: null as unknown as TextDirectiveSettings,
        ModelSettings: null as unknown as ModelDirectiveSettings,
        LoopSettings: null as unknown as LoopDirectiveSettings,
        HtmlSettings: null as unknown as HtmlDirectiveSettings,
        EffectSettings: null as unknown as EffectDirectiveSettings,
        ValueSettings: null as unknown as ValueDirectiveSettings,
        DisplaySettings: null as unknown as VisibilitySettings,
        ReloadSettings: null as unknown as ReloadSettings,
        WaitSettings: null as unknown as WaitSettings,
        LogicDirectiveSettings: null as unknown as LogicDirectiveSettings
    }

    public dispose() {


        if (this.Configuration.LoopSettings && this.loopDirective) this.loopDirective.dispose(this.Configuration.LoopSettings, this.Configuration.LoopSettings.fragment);
        if (this.Configuration.TextSettings && this.textDirective) this.textDirective.dispose(this.Configuration.TextSettings, this.owner);
        if (this.Configuration.ModelSettings && this.modelDirective) this.modelDirective.dispose(this.Configuration.ModelSettings, this.owner);

        if (this.Configuration.HtmlSettings && this.htmlDirective) this.htmlDirective.dispose(this.Configuration.HtmlSettings, this.owner);
        if (this.Configuration.EffectSettings && this.effectDirective) this.effectDirective.dispose(this.Configuration.EffectSettings, this.owner);
        if (this.Configuration.ValueSettings && this.valueDirective) this.valueDirective.dispose(this.Configuration.ValueSettings, this.owner);

        if (this.Configuration.DisplaySettings && this.displayDirective) this.displayDirective.dispose(this.Configuration.DisplaySettings, this.owner);
        if (this.Configuration.ReloadSettings && this.relloadDirective) this.relloadDirective.dispose(this.Configuration.ReloadSettings, this.owner);
        if (this.Configuration.WaitSettings && this.waitDirective) this.waitDirective.dispose(this.Configuration.WaitSettings, this.owner);
        if (this.Configuration.LogicDirectiveSettings && this.logicDirective) this.logicDirective.dispose(this.Configuration.LogicDirectiveSettings, this.owner);
        this.attributeDirectives.forEach((v, k) => {
            v.dispose(k, this.owner);
        })
    }
    public hasUsedState(): boolean {
        if (this.Configuration.LoopSettings && this.loopDirective) return true;
        if (this.Configuration.TextSettings && this.textDirective) return true;
        if (this.Configuration.ModelSettings && this.modelDirective) return true;

        if (this.Configuration.HtmlSettings && this.htmlDirective) return true;
        if (this.Configuration.EffectSettings && this.effectDirective) return true;
        if (this.Configuration.ValueSettings && this.valueDirective) return true;

        if (this.Configuration.DisplaySettings && this.displayDirective) return true;
        if (this.Configuration.ReloadSettings && this.relloadDirective) return true;
        if (this.Configuration.WaitSettings && this.waitDirective) return true;
        if (this.Configuration.LogicDirectiveSettings && this.logicDirective) return true;
        if (this.attributeDirectives.size > 0) { return true }
        return false;
    }
    public async init() {
      
        if (this.Configuration.LoopSettings && this.loopDirective) this.loopDirective.init(this.Configuration.LoopSettings, this.Configuration.LoopSettings.fragment);
        if (this.Configuration.TextSettings && this.textDirective) this.textDirective.init(this.Configuration.TextSettings, this.owner);
        if (this.Configuration.ModelSettings && this.modelDirective) this.modelDirective.init(this.Configuration.ModelSettings, this.owner);

        if (this.Configuration.HtmlSettings && this.htmlDirective) this.htmlDirective.init(this.Configuration.HtmlSettings, this.owner);
        if (this.Configuration.EffectSettings && this.effectDirective) this.effectDirective.init(this.Configuration.EffectSettings, this.owner);
        if (this.Configuration.ValueSettings && this.valueDirective) this.valueDirective.init(this.Configuration.ValueSettings, this.owner);

        if (this.Configuration.DisplaySettings && this.displayDirective) this.displayDirective.init(this.Configuration.DisplaySettings, this.owner);
        if (this.Configuration.ReloadSettings && this.relloadDirective) this.relloadDirective.init(this.Configuration.ReloadSettings, this.owner);
        if (this.Configuration.LogicDirectiveSettings && this.logicDirective) this.logicDirective.init(this.Configuration.LogicDirectiveSettings, this.owner);
        // if (this.Configuration.WaitSettings && this.waitDirective) this.waitDirective.init(this.Configuration.WaitSettings, this.owner);
       
        this.attributeDirectives.forEach((v, k) => {
            v.init(k, this.owner);
          
        })
    }

    public async update(prop: any, key: any, type: string) {
        console.error("UPDATE")
    }
    public setup(prop: any, key: any) { }



    public text(prop: any, key: string): Directive
    public text(callback: () => void): Directive
    public text(): Directive {
        this.Configuration.TextSettings = new TextDirectiveSettings();
        this.textDirective = new TextDirective();
        if (arguments.length === 2) {
            this.Configuration.TextSettings.Property = arguments[0]
            this.Configuration.TextSettings.FieldName = arguments[1];
            this.Configuration.TextSettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.TextSettings.callback = arguments[0];
                this.Configuration.TextSettings.type = "function";
            }
        }

        if (this.owner.isRendered) {
            if (this.Configuration.TextSettings && this.textDirective) this.textDirective.init(this.Configuration.TextSettings, this.owner);
        }

        return this;
    }

    public html(prop: any, key: string): Directive
    public html(callback: () => void): Directive
    public html(): Directive {
        this.Configuration.HtmlSettings = new HtmlDirectiveSettings();
        this.htmlDirective = new HtmlDirective();
        if (arguments.length === 2) {
            this.Configuration.HtmlSettings.Property = arguments[0]
            this.Configuration.HtmlSettings.FieldName = arguments[1];
            this.Configuration.HtmlSettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.HtmlSettings.callback = arguments[0].bind(this.owner);
                this.Configuration.HtmlSettings.type = "function";
            }
        }

        if (this.owner.isRendered) {
            if (this.Configuration.HtmlSettings && this.htmlDirective) this.htmlDirective.init(this.Configuration.HtmlSettings, this.owner);
        }
        return this;
    }

    public model(prop: any, key: string): Directive
    public model(callback: () => void): Directive
    public model(): Directive {
        this.Configuration.ModelSettings = new ModelDirectiveSettings();
        this.modelDirective = new ModelDirective();
        if (arguments.length === 2) {
            this.Configuration.ModelSettings.Property = arguments[0]
            this.Configuration.ModelSettings.FieldName = arguments[1];
            this.Configuration.ModelSettings.type = "expression";
            // var data =isReactive(this.Configuration.ModelSettings.Property ); 
            // console.error('dataA',data)
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.ModelSettings.callback = arguments[0];
                this.Configuration.ModelSettings.type = "function";
                // var data = isReactive(arguments[0]()); 
                // console.error('dataB',data)
            }
        }

        if (this.owner.isRendered) {
            if (this.Configuration.ModelSettings && this.modelDirective) this.modelDirective.init(this.Configuration.ModelSettings, this.owner);
        }
        return this;
    }

    public value(prop: any, key: string): Directive
    public value(callback: () => void): Directive
    public value(): Directive {
        this.Configuration.ValueSettings = new ValueDirectiveSettings();
        this.valueDirective = new ValueDirective();
        if (arguments.length === 2) {
            this.Configuration.ValueSettings.Property = arguments[0]
            this.Configuration.ValueSettings.FieldName = arguments[1];
            this.Configuration.ValueSettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.ValueSettings.callback = arguments[0];
                this.Configuration.ValueSettings.type = "function";
            }
        }
        if (this.owner.isRendered) {

            if (this.Configuration.ValueSettings && this.valueDirective) this.valueDirective.init(this.Configuration.ValueSettings, this.owner);
        }
        return this;
    }

    public loop(prop: any, key: string, itemTemplate: (data: any) => IControl<any>): Directive
    public loop(callback: () => void, itemTemplate: (data: any) => IControl<any>): Directive
    public loop(): Directive {
        this.Configuration.LoopSettings = new LoopDirectiveSettings();
        this.loopDirective = new LoopDirective();

        if (arguments.length === 3) {
            this.Configuration.LoopSettings.Property = arguments[0]
            this.Configuration.LoopSettings.FieldName = arguments[1];
            this.Configuration.LoopSettings.render = arguments[2];
            this.Configuration.LoopSettings.type = "expression";
        }
        else if (arguments.length === 2) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.LoopSettings.callback = arguments[0];
                this.Configuration.LoopSettings.render = arguments[1];
                this.Configuration.LoopSettings.type = "function";
            }
            else if (Array.isArray(arguments[0])) {
                this.Configuration.LoopSettings.callback = () => arguments[0];
                this.Configuration.LoopSettings.render = arguments[1];
                this.Configuration.LoopSettings.type = "function";
            }
        }
        var fr = new MoviComponent(null, {});
        this.Configuration.LoopSettings.fragment =   fr;
         this.owner.controls.add(fr);
        if (this.owner.isRendered) {
            if (this.Configuration.LoopSettings && this.loopDirective) this.loopDirective.init(this.Configuration.LoopSettings, fr);
        }
        return this;
    }


    public effect(callback: () => any): Directive {
        this.Configuration.EffectSettings = new EffectDirectiveSettings();
        this.effectDirective = new EffectDirective();
        this.Configuration.EffectSettings.callback = callback;
        this.Configuration.EffectSettings.type = "function";
        if (this.owner.isRendered) {
            if (this.Configuration.EffectSettings && this.effectDirective) this.effectDirective.init(this.Configuration.EffectSettings, this.owner);
        }
        return this;
    }


    public display(prop: any, key: string): Directive
    public display(callback: () => void): Directive
    public display(): Directive {
        this.Configuration.DisplaySettings = new VisibilitySettings();
        this.displayDirective = new VisibilityDirective();
        if (arguments.length === 2) {
            this.Configuration.DisplaySettings.Property = arguments[0]
            this.Configuration.DisplaySettings.FieldName = arguments[1];
            this.Configuration.DisplaySettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.DisplaySettings.callback = arguments[0];
                this.Configuration.DisplaySettings.type = "function";
            }
        }
        if (this.owner.isRendered) {
            if (this.Configuration.DisplaySettings && this.displayDirective) this.displayDirective.init(this.Configuration.DisplaySettings, this.owner);
        }
        return this;
    }

    public reload(prop: any, key: string): Directive
    public reload(callback: () => void): Directive
    public reload(): Directive {
        this.Configuration.ReloadSettings = new ReloadSettings();
        this.relloadDirective = new ReloadDirective();
        if (arguments.length === 2) {
            this.Configuration.ReloadSettings.Property = arguments[0]
            this.Configuration.ReloadSettings.FieldName = arguments[1];
            this.Configuration.ReloadSettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.ReloadSettings.callback = arguments[0];
                this.Configuration.ReloadSettings.type = "function";
            }
        }
        if (this.owner.isRendered) {
            if (this.Configuration.ReloadSettings && this.relloadDirective) this.relloadDirective.init(this.Configuration.ReloadSettings, this.owner);
        }
        return this;
    }

    public wait(prop: any, key: string): Directive
    public wait(callback: () => void): Directive
    public wait(): Directive {
       
        this.Configuration.WaitSettings = new VisibilitySettings();
        this.waitDirective = new WaitDirective();
        if (arguments.length === 2) {
            this.Configuration.WaitSettings.Property = arguments[0]
            this.Configuration.WaitSettings.FieldName = arguments[1];
            this.Configuration.WaitSettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.WaitSettings.callback = arguments[0];
                this.Configuration.WaitSettings.type = "function";
            }
        }

        // if (this.owner.isRendered) { 
        //     if (this.Configuration.WaitSettings && this.waitDirective) this.waitDirective.init(this.Configuration.WaitSettings, this.owner);
        // }
        
        return this;
    }

    public focus(prop: any, key: string): Directive
    public focus(callback: () => void): Directive
    public focus(): Directive {

        var Settings = new AttributeHandlingSettings();
        Settings.attributes.add("focus")
        var Directive = new AttributeHandlingDirective();
        if (arguments.length === 2) {
            Settings.Property = arguments[0]
            Settings.FieldName = arguments[1];
            Settings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                Settings.callback = arguments[0];
                Settings.type = "function";
            }
        }
        this.attributeDirectives.set(Settings, Directive);
        // if (this.owner.isRendered) { 
        //     if (this.Configuration.WaitSettings && this.waitDirective) this.waitDirective.init(this.Configuration.WaitSettings, this.owner);
        // }

        return this;
    }

    public logic(state, cb) {

        this.Configuration.LogicDirectiveSettings = new LogicDirectiveSettings();
        this.logicDirective = new LogicDirective();
        this.Configuration.LogicDirectiveSettings.logicalFn = state;
        this.Configuration.LogicDirectiveSettings.callback = cb;
        this.Configuration.LogicDirectiveSettings.type = "function";
        return this;
    }

    public computed(a) {
        var r = a();
        if (Array.isArray(r)) {
            r.forEach(rr => {
                if (typeof rr === 'string') {
                    var c = new Component('text');
                    c.setText(rr);
                    this.owner.controls.add(c)
                } else {
                    this.owner.controls.add(rr)
                }

            })
        } else {
            if (typeof r === 'string') {
                var c = new Component('text');
                c.setText(r);
                this.owner.controls.add(c)
            } else {
                this.owner.controls.add(r)
            }
            
        }


    }
}