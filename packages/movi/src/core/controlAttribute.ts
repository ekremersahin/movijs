import { KeyValueItem, toKebab } from ".";
import { IAttribute, IControl } from "../abstractions";

export class controlAttribute<ElementType extends Element | HTMLElement | Text | DocumentFragment | Comment> implements IAttribute<IControl<ElementType>> {
    private _parent: IControl<ElementType>;
    constructor(parent: IControl<ElementType>) {
        this._parent = parent;
    }

    attributes: { name: string, value: any }[] = [];
    add(attribute: object | string): IControl<ElementType> {
        if (typeof attribute === "object") {
            Object.keys(attribute).forEach(cn => {



                if (this._parent.element instanceof HTMLElement ||
                    this._parent.element instanceof Element ||
                    this._parent.element instanceof SVGElement ||
                    this._parent.element instanceof SVGAElement) {

                    var attrval = attribute[cn];
                    if (attrval && attrval['toLowerCase'] && attrval.toLowerCase() === 'preserveaspectratio') {
                        attrval = 'preserveAspectRatio'
                    }
                    var self = this;

                    if (typeof attrval === 'function') {
                        this._parent.bind.effect(() => {
                            var v = attrval();
                            (self._parent.element as Element).setAttribute(cn, v)
                        });
                    } else if (typeof attrval === 'boolean') {
                        if (attrval == true) {
                            this._parent.element.setAttribute(cn, '')
                        } else {
                            this._parent.element.removeAttribute(cn)
                        }
                    } else if (cn === 'class' || cn === 'className' || cn === 'classname') {
                        this._parent.class.add(attrval);
                    } else if (attrval === undefined || attrval === null || attrval === '') {
                        this._parent.element.setAttribute(cn, '')
                    } else {
                        try {
                            this._parent.element.setAttribute(cn, attrval)
                        } catch (error) {
                            console.error(cn, attrval)
                        }

                    }
                } else {
                    if (!this.attributes.find(t => t.name === cn)) {
                        this.attributes.push({ name: cn, value: attribute[cn] });
                    } else {
                        var el = this.attributes.find(t => t.name === cn);
                        if (el !== undefined) {
                            el.value = attribute[cn]
                        }
                    }
                }
            })
        } else if (typeof attribute === 'string') {
            if (this._parent.element instanceof HTMLElement ||
                this._parent.element instanceof Element) {
                this._parent.element.setAttribute(attribute, '');
            }
        }
        return this._parent;
    };
    remove(key: string): IControl<ElementType> {
        if (this._parent.element instanceof HTMLElement ||
            this._parent.element instanceof Element) {
            this._parent.element.removeAttribute(key)
        }
        return this._parent;
    };
    has(key: string): boolean {

        if (this._parent.element instanceof HTMLElement ||
            this._parent.element instanceof Element) {
            return this._parent.element.hasAttribute(key)
        }
        return false;
    };
    get(key: string): string | null {

        if (this._parent.element instanceof HTMLElement ||
            this._parent.element instanceof Element) {
            return this._parent.element.getAttribute(key)
        }
        return null;
    };
}