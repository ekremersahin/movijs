import {
    createGetter,
    createSetter,
    createHas,
    createDelete,
    createOwn
} from "./main"

export class DepthHandler<T extends object>
    implements ProxyHandler<T>{
    get = createGetter(false, false);
    set = createSetter(false);
    has = createHas();
    deleteProperty = createDelete();
    ownKeys = createOwn(); 
    constructor(public root?:any) {}
}
