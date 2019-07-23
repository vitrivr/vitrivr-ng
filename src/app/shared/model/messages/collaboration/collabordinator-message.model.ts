import {CollabordinatorAction} from "./collabordinator-action.model";

export interface CollabordinatorMessage {
    action: CollabordinatorAction
    key: string
    attribute: string[]
}