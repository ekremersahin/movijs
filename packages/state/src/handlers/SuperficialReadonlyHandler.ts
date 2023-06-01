import {
    createGetter 
} from "./main"
 
//TODO: next future
export class SuperficialReadonlyHandler<T extends object>
    implements ProxyHandler<T>{
    get = createGetter(true, true);
    set(target: T, p: string | symbol, newValue: any, receiver: any): boolean {
        return true;
    }
    deleteProperty(target: T, p: string | symbol): boolean {
        return true;
    }
}