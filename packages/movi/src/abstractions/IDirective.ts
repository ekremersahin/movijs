
import { IControl } from "./IControl";

export interface IDirective<SettingsModel> {
    id: any;
    init(settings: SettingsModel, Source: IControl<any>): void;
    dispose(settings: SettingsModel, Source: IControl<any>): void
    start(key?): void;
    update(key?): void;
    isArray:boolean,
    push?(val); 
    splice?(val);
    slice?(val);
    pop?(val);
    shift?(val);
    unshift?(val);
    set?(val);
    reverse?(val);
    setup?(target, key);
}