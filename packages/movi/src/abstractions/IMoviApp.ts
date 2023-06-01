import { IConfigurationOptions, IControl, IServiceManager } from ".";
import { NavigateEventArgs } from "../core";
import { IApplicationService } from "./IApplicationService";

export interface IMoviApp { 
    Services?: IServiceManager;
    Configuration?(options: IConfigurationOptions):void;
    ServiceConfiguration?(services: IServiceManager):void;
    Navigate?(e: NavigateEventArgs):void;
    offline?(sender: IMoviApp, e: Event):void;
    online?(sender: IMoviApp, e: Event): void;
    use?(module: any): void;
    context?: IApplicationService; 
}