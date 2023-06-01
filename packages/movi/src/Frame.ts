import { IControl } from "./abstractions";
import { ApplicationService } from "./ApplicationService";

import { Component } from "./Component";

export class Frame extends Component<any, any>{

    public current: IControl<any> | null = null;
    isBusy: boolean = false;
    private isNavigated: boolean = false;
    private currentUri = "";
    onmounted(sender) { 
        if (sender.context.ControlCollection.has(sender.parent)) { 
            sender.context.ControlCollection.delete(sender.parent)
        } 
        sender.context.ControlCollection.set(sender.parent, sender); 
    }

    public async dispose() {
        this.context.ControlCollection.delete(this.parent);
        this.context.ControlCollection.delete(this);
        if (this.current != null) {
            await this.current.dispose();
        }
        await super.dispose();
    }
    public async flush() {
        if (this.current != null) {
            this.current.dispose();
        }
        super.flush();
    }
    public async clear() {
        if (this.current != null) {
            this.current.dispose();
        }
        super.clear();
    }
    constructor() {
        super(document.createComment(''), { settings: { isFrame: true } });
        this.isFragment = true;

    }

    public async navigate(page: IControl<any>) { 
      
        if (page == null) { return }
        if (this.isBusy == true) { return };
        if (this.current !== null && this.current === page) {
            return
        }
        this.isBusy = true;
        page.parent = this.parent;
       
         
        if (this.current != null) {
            await this.current.dispose();
        }

        this.current = page;

        ApplicationService.current['lastPage'] = page;

        try {

            page.build();
            if (page['nodes']) {
                page['nodes'].forEach(async c => {
                    c.parent = this;
                    this.parent.element.insertBefore(c.element, this.element);
                    if (!c.isRendered) {
                        c.build();
                    }
                })
            } else {
                this.parent.element.insertBefore(page.element, this.element);
            }

            // (page as any).addEnterTransition();
            // await (page as any).waitTransition('enter');

        } catch (error) {
            console.error(error)
        }

        // if (this.currentUri != this.context.route.path) {
        //     this.context.internal.notify('routeChanged')
        // }
        this.currentUri = page.context.route.path;
        this.isNavigated = true;
        this.isBusy = false;

        
    }
}
