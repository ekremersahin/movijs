import { IControl } from "./abstractions/IControl";
import { Component } from "./Component";
import { CreateLocalElement } from "./core";

export class RouterLinkOptions {
    public to?: string = "/";
    public el?: string = "a";
    public showHref?: boolean = false;
    public text: string = "Link";
    public slots: IControl<any>[] = [];
    public exactClass: string = '';
    public activeClass: string = '';
    public bypass: boolean = false;
}

export function RouterFunctionalLink(props:RouterLinkOptions) { 

}
export class RouterLink extends Component<HTMLElement, RouterLinkOptions> {
    private _href: string = "/";
    public name: string = '';
    public to?: string = "/";
    public el?: string = "a";
    public showHref?: boolean = false;
    public text: string = "Link";
    public slots: IControl<any>[] = [];
    public exactClass: string = '';
    public activeClass: string = '';
    public bypass: boolean = false;
    onExact?();
    offExact?();
    onActive?();
    offActive?(); 
    onRouteChanged() {
        this.setClassed();
    }
    activating() {
        if (this.name != null && this.name != '') {
            var newpath = this.context.RouteManager.get(this.name);
            if (newpath) {

                this.href = newpath.ParentPath as string;
            }
        }
    }
   
    public set href(v: string) {

        if (v === undefined || v === null) { return }

        this._href = v;
        if (this.context.RouteManager.router.mode === "history") {

            if (!v.startsWith("/") && !v.startsWith("http")) {
                this._href = "/" + this._href;
            }
        } else {
            if (!v.startsWith("#") && !v.startsWith("http")) {
                this._href = "#" + this._href;
            }
        }

        if (this.element instanceof HTMLAnchorElement) {
            this.attr.add({ 'href': v });
        } else {
            if (this['showHref'] && this['showHref'] === true) {
                this.attr.add({ 'to': v });
            } 
        } 
    }
    public get href(): string {
        return this._href;
    }
    //public to: string = "/", public el: string = "a", public options: any = {},public caption:string = "Link"
    constructor(option: RouterLinkOptions) {
       
        super(CreateLocalElement(option.el ? option.el : 'a'), option as any)
        Object.assign(this, {...option}); 
        
        if (option.to) {
            if (typeof option.to === 'object') {
                this.href = option.to['to'];
            } else {
                this.href = option.to;
            }
        } else {
            this.href = "/";
        }
        if (option.slots && option.slots.length > 0) {
            option.slots.forEach(slot => {
                this.controls.add(slot);
            })
        }
      
            this.linkClick = this.linkClick.bind(this);
            this.addHandler('click', this.linkClick); 
          
      
        var self = this;
        this.setClassed = this.setClassed.bind(this);
       
        
        
       
    }
    setup() { 
        this.setClassed();
    }
    
    private setClassed() { 
        if (this.props.activeClass && this.props.activeClass !== '' && this.context.route.path.split("?")[0] === this._href.split("?")[0]) { 
            this.element.classList.add(this.props.activeClass);
            if (this.props.exactClass && this.props.exactClass !== '') {this.element.classList.remove(this.props.exactClass);}
            if (this.onActive) { this.onActive() }
        } else {
            if (this.props.activeClass && this.props.activeClass !== '') this.element.classList.remove(this.props.activeClass);

            if (this.offActive) { this.offActive() }

            if (this.props.exactClass && this.props.exactClass !== '' && this.context.route.tree) { 
                var i = this.context.route.tree.find(t => t.split("?")[0] === this._href.split("?")[0]); 
                if (i) {
                    this.element.classList.add(this.props.exactClass);
                    if (this.onExact) { this.onExact() }
                } else {
                    if (this.offExact) { this.offExact() }
                    this.element.classList.remove(this.props.exactClass);
                }
            } 
        }
    }
    private linkClick(sender: IControl<any>, e: Event) {
        if (this.props.bypass) {
            
            //e.stopPropagation();
            e.preventDefault();
            return false;
        }
        
            e.preventDefault();
            var target = this.href;
    
            if (this.context.RouteManager.router.mode === "history") {
                this.context.RouteManager.router.trigger(target);
                e.stopPropagation();
                this.Openned?.call(this);
                return false;
            } else {
                this.context.RouteManager.router.trigger(target);
                return true;
            }
        
       
    }
 
    public Openned!: () => void;
}

