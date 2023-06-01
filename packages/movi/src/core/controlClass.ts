import { KeyValueItem, toKebab } from ".";
import { IAttribute, IClass, IControl } from "../abstractions";

export class controlClass<ElementType extends Element | HTMLElement | Text | DocumentFragment | Comment> implements IClass<IControl<ElementType>> {
    private _parent: IControl<ElementType>;
    constructor(parent: IControl<ElementType>) {
        this._parent = parent;
    }
    add(values: string | string[] | {} | {}[] | Function): IControl<ElementType> {

        var classNames = values;
        if (typeof classNames === 'function') {
            classNames = classNames();
        }

        if (Array.isArray(classNames)) {
            classNames.forEach(cn => {
                if (typeof cn === 'object') {
                    Reflect.ownKeys(cn).forEach(c => {
                        if (typeof cn[c] !== 'function') {
                            if (cn[c]) {
                                if (this._parent.element instanceof HTMLElement ||
                                    this._parent.element instanceof Element) {
                                    this._parent.element.classList.add(c.toString().trim())
                                }
                            } else {
                                if (this._parent.element instanceof HTMLElement ||
                                    this._parent.element instanceof Element) {
                                    this._parent.element.classList.remove(c.toString().trim())
                                }
                            }
                        }
                        if (typeof cn[c] === 'function') {
                            this._parent.bind.effect(() => {
                                if (cn[c]()) {
                                    if (this._parent.element instanceof HTMLElement ||
                                        this._parent.element instanceof Element) {
                                        this._parent.element.classList.add(c.toString().trim())
                                    }
                                } else {
                                    if (this._parent.element instanceof HTMLElement ||
                                        this._parent.element instanceof Element) {
                                        this._parent.element.classList.remove(c.toString().trim())
                                    }
                                }
                            })
                        }
                    })
                } else {
                    cn.trim().split(" ").forEach(cls => {
                        if (this._parent.element instanceof HTMLElement ||
                            this._parent.element instanceof Element) {
                            this._parent.element.classList.add(cls.trim())
                        }
                    })
                }
            })
        } else if (typeof classNames === 'object') {
            Reflect.ownKeys(classNames).forEach(c => {
                if (typeof classNames[c] !== 'function') {
                    if (classNames[c]) {
                        if (this._parent.element instanceof HTMLElement ||
                            this._parent.element instanceof Element) {
                            this._parent.element.classList.add(c.toString().trim())
                        }
                    } else {
                        if (this._parent.element instanceof HTMLElement ||
                            this._parent.element instanceof Element) {
                            this._parent.element.classList.remove(c.toString().trim())
                        }
                    }
                } 
                if (typeof classNames[c] === 'function') {
                    this._parent.bind.effect(() => {
                        if (classNames[c]()) {
                            if (this._parent.element instanceof HTMLElement ||
                                this._parent.element instanceof Element) {
                                this._parent.element.classList.add(c.toString().trim())
                            }
                        } else {
                            if (this._parent.element instanceof HTMLElement ||
                                this._parent.element instanceof Element) {
                                this._parent.element.classList.remove(c.toString().trim())
                            }
                        }
                    })
                }
            }) 
        } else if (typeof classNames === 'string') { 
            classNames.trim().split(" ").forEach(cls => {
                if (this._parent.element instanceof HTMLElement ||
                    this._parent.element instanceof Element) {
                    this._parent.element.classList.add(cls.trim())
                } 
            }) 
        } 
        return this._parent;
    }
    remove(classNames: string | string[]): IControl<ElementType> {

        if (Array.isArray(classNames)) {
            classNames.forEach(cn => {
                cn.trim().split(" ").forEach(cls => {
                    if (this._parent.element instanceof HTMLElement ||
                        this._parent.element instanceof Element) {
                        this._parent.element.classList.remove(cls.trim())
                    }
                })
            })
        } else {
            if (classNames == '**') {
                if (this._parent.element instanceof HTMLElement ||
                    this._parent.element instanceof Element) {
                    for (let index = this._parent.element.classList.length; index > -1; index--) {
                        this._parent.element.classList.item(index) && this._parent.element.classList.remove();
                    }
                }
            } else {
                classNames.trim().split(" ").forEach(cls => {
                    if (this._parent.element instanceof HTMLElement ||
                        this._parent.element instanceof Element) {
                        this._parent.element.classList.remove(cls.trim())
                    }
                })
            }
        }
        return this._parent;
    }
    has(className: string): boolean {
        if (this._parent.element instanceof HTMLElement ||
            this._parent.element instanceof Element) {
            return this._parent.element.classList.contains(className.trim())
        }
        return false;
    }

}