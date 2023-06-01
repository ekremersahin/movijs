import { RefSymbol } from "../constants"

export interface IReference<T = any> {
    value: T 
    [RefSymbol]: true
}
 