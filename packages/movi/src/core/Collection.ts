export class Collection<T extends Object> extends Array {
    public ItemAdded?: (i: T) => void;
    public ItemAddedBefore?: (i: T) => void;
    public ItemSplice?: (start: number, i: T) => void;
    public _map: Map<T, any> = new Map<T, any>();
    public add(item: T): number {
        this._map.set(item, item);
        var i = this.push(item) - 1;
        try {
            return i;
        } finally {
            if (this.ItemAdded != undefined) { this.ItemAdded(item); };
        }


    }
    public addBefore(item: T) {
        this._map.set(item, item);
        var i = this.unshift(item) - 1;
        if (this.ItemAddedBefore != undefined) { this.ItemAddedBefore(item); };
        return i;
    }
    public insert(start: number, item: T) {
        this._map.set(item, item);
        var i = this.splice(start, 0, item);
        if (this.ItemSplice != undefined) { this.ItemSplice(start, item); };
        return i;
    }
    public remove(item: T) {
        this._map.delete(item);
        var index = this.indexOf(item);
        this.splice(index, 1);
    }

    public item(key: T): T {
        return this._map.get(key);
    }
    public has(item: T) {
        return this._map.has(item);
    }

    public clear() {
        this.splice(0);
        this._map.clear();
    }

    public itemIndex(index: number): T {
        return this[index];
    }


}

export class KeyValueItem {
    public key: string = '';
    public value: any;
}
