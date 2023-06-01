import {
    createGetter,
    createSetter,
    createHas,
    createDelete,
    createOwn
} from "./main"
 

export class SuperficialHandler<T extends object>
    implements ProxyHandler<T>{
    get = createGetter(false, true);
    set = createSetter(true);
    has = createHas();
    deleteProperty = createDelete();
    ownKeys = createOwn();
} 