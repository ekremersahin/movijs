import { IApplicationService } from "../../../movi/src/abstractions/IApplicationService"
import { Flags } from "../constants"

export interface IModelType {
  [Flags.SKIP]?: boolean
  [Flags.IS_REACTIVE]?: boolean
  [Flags.IS_READONLY]?: boolean
  [Flags.IS_SUPERFICIAL]?: boolean
  [Flags.RAW]?: any
  [Flags.CONTEXT]?: IApplicationService
}
