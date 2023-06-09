

import { IControl  } from "../abstractions";
export type routeType = {
    path: string,
    extend: object,
    params: object,
    name: string,
    tree:string[]
}
export class NavigateEventArgs {
    route: routeType | undefined;
    resume: boolean = true;
    onShow: ((IControl: IControl<any>) => void) | undefined;
    redirect: string = "";
    currentPage!: IControl<any>;
}