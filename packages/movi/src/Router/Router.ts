import { IControl } from "../abstractions/IControl";
import { IRouter } from "../abstractions/Router";
import { ApplicationService } from "../ApplicationService";
import { NavigateEventArgs } from "../core/NavigateEventArgs";

export class Router implements IRouter {
    
    constructor(manager: any) {
        this.mode = 'history';
        this.HandlePopChange = this.HandlePopChange.bind(this);
        this.HandleHashChange = this.HandleHashChange.bind(this);
        this.navigate = this.navigate.bind(this);
        this.manager = manager;
    }
    defaultLayout: any;
    values: { name: string; value: string; }[] = null as any;
    public prev = "__boot__";
    value(name: string) {
        return this.values.filter(x => x.name == name)[0]?.value;
    }

    private _mode = 'history';
    public set mode(m: string) {
        this._mode = m;
        this.removeUriListener();
        this.addUriListener();
    }
    public get mode(): string {
        return this._mode;
    }

    root: string = '/';
    manager: any;
    _skipCheck: any = false;
    HandleChange: (e: any) => void = null as any;
    gate?: ((next: () => any, e: NavigateEventArgs) => any) | undefined;

    private Handlers = new Set<any>()
    public onChange(callback: any) {
        if (!this.Handlers.has(callback)) {
            this.Handlers.add(callback);
        }
    }
    public offChange(callback: any) {
        this.Handlers.delete(callback);
    }
    public async trigger(uri: string) {
       
        if (this.prev !== uri) {
          
            var fx = this.manager.GetRouteDetails(uri);
            

            var ea = new NavigateEventArgs();
            ea.currentPage = ApplicationService.current['lastPage'] as unknown as IControl<any>;
            ea.route = {
                path: uri,
                extend: fx.extend,
                params: fx.params,
                name: fx.name,
                tree: fx.tree,

            };
            var self = this;
            const goto = async function () {
                var p = ea.route ? ea.route.path : '/';
                if (ea.redirect !== '' && self.manager.routeNames.has(ea.redirect)) {
                    p = self.manager.routeNames.get(ea.redirect).path;
                }


                var nxt = self.manager.GetRouteDetails(p);
                var route = {
                    path: p,//self.manager.router.getFragment(),
                    extend: nxt.extend,
                    params: nxt.params,
                    name: nxt.name,
                    tree: nxt.tree
                };
                (ApplicationService.current as any)["route"] = route;

               
                var c = await self.manager.GetController(p, () => {  
                    self.navigate(p);
                });
              
                //ApplicationService.current.send('routeChanged')
                ApplicationService.current.internal.notify('routeChanged')
                
            }
            if (this.gate) {
                this.gate(async() => { await goto() }, ea);
            } else {
                goto();
            }

        }
    }
    public navigate(url: string) {

        if (this.mode === "history") {
            if (window.history != null) {
                if (!url.startsWith("/")) {
                    url = "/" + url;
                }
                this.prev = url;
                window.history.pushState({}, '', url);
            }
        } else {
            if (this.prev !== url) {
                this.prev = url;
                window.location.hash = url;
            }
        }
    }
    public HandlePopChange() {
        this.trigger(this.CurrentPage);
    }
    public HandleHashChange() {

        this.trigger(this.CurrentPage);

    }


    public get CurrentPage(): string { return this.getFragment(); };

    addUriListener() {
        if (this.mode === "history") {
            window.addEventListener('popstate', this.HandlePopChange.bind(this))
        } else {
            window.addEventListener('hashchange', this.HandleHashChange.bind(this))
        }
        return this;
    }
    removeUriListener() {
        window.onpopstate = null;
        window.onhashchange = null;
        return this;
    }

    _getHistoryFragment() {
        var fragment = decodeURI(window.location.pathname + window.location.search);
        if (this.root !== "/") {
            fragment = fragment.replace(this.root, "");
        }
        return this._trimSlashes(fragment);
    }
    _getHashFragment() {
        var hash = window.location.hash.substring(1).replace(/(\?.*)$/, "");
        if (!hash.startsWith("/")) {
            hash = "/" + hash;
        }
        return this._trimSlashes(hash);
    }
    getFragment() {
        var h;
        if (this.mode === "history") {
            h = this._getHistoryFragment();
        } else {
            h = this._getHashFragment();
        }
        return h;
    }

    private previouspath!: string;
    public isChanged(): boolean {
        var r = this.previouspath != this.getFragment();
        this.previouspath = this.getFragment();
        return r;
    }

    private _trimSlashes(path: string) {
        if (typeof path !== "string") {
            return "";
        }
        var tt = path.toString().replace(/\/$/, "").replace(/^\//, "");
        if (!tt.startsWith("/")) {
            tt = "/" + tt;
        }
        return tt;
    }

}
