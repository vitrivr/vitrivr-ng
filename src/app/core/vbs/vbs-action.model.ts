import {Observable} from "rxjs/Observable";
import {InteractionEventType} from "../../shared/model/events/interaction-event-type.model";
import {InteractionEvent} from "../../shared/model/events/interaction-event.model";

export enum VbsActionType {
    KEYWORD = "K",
    AUDIO = "A",
    OCR = "O",
    COLORSKETCH = "C",
    EDGESKETCH = "E",
    MOTIONSKETCH = "M",
    SIMILARITY = "S",
    FILTERING = "F",
    PAGING = "P",
    BROWSING = "B"
}

export class VbsAction {
    /**
     * Default constructor for VbsAction.
     *
     * @param {VbsActionType} action The type of action.
     * @param {string} context Optional context information.
     */
    constructor(public readonly action: VbsActionType, public readonly context?: string) {}

    /**
     * Returns a string representation of this VbsAction.
     *
     * @return {any}
     */
    public toString() {
        return this.action + (this.context ? "(" + this.context + ")" : "");
    }

    /**
     * This method maps the events emitted on the Vitrivr NG EventBusService to VbsActions.
     *
     * @param {Observable<InteractionEvent>} stream The observable of the InteractionEvents as exposed by the EventBusService
     */
    public static mapEventStream(stream: Observable<InteractionEvent>): Observable<VbsAction[]> {
        return stream.map(e => {
            let actions: VbsAction[]  = [];
            e.components.forEach(c => {
                switch (c.type) {
                    case InteractionEventType.QUERY_AUDIO:
                        actions.push(new VbsAction(VbsActionType.AUDIO));
                        break;
                    case InteractionEventType.QUERY_MOTION:
                        actions.push(new VbsAction(VbsActionType.MOTIONSKETCH));
                        break;
                    case InteractionEventType.MLT:
                        actions.push(new VbsAction(VbsActionType.SIMILARITY, c.context.get("q:value")));
                        break;
                    case InteractionEventType.QUERY_TAG:
                        actions.push(new VbsAction(VbsActionType.MOTIONSKETCH));
                        break;
                    case InteractionEventType.QUERY_FULLTEXT: {
                        let categories = c.context.get("q:categories");
                        if (categories.indexOf("tagft") > -1 || categories.indexOf("meta") > -1) actions.push(new VbsAction(VbsActionType.KEYWORD, c.context.get("q:value")));
                        if (categories.indexOf("ocr") > -1) actions.push(new VbsAction(VbsActionType.OCR, c.context.get("q:value")));
                        if (categories.indexOf("asr") > -1) actions.push(new VbsAction(VbsActionType.AUDIO, c.context.get("q:value") + ",subtitles"));
                        break;
                    }
                    case InteractionEventType.QUERY_IMAGE: {
                        let categories = c.context.get("q:categories");
                        if (categories.indexOf("globalcolor") > -1 || c.context.get("q:categories").indexOf("localcolor") > -1) actions.push(new VbsAction(VbsActionType.COLORSKETCH));
                        if (categories.indexOf("edge") > -1) actions.push(new VbsAction(VbsActionType.EDGESKETCH));
                        break;
                    }
                    case InteractionEventType.FILTER:
                        actions.push(new VbsAction(VbsActionType.FILTERING));
                        break;
                    case InteractionEventType.REFINE:
                        actions.push(new VbsAction(VbsActionType.BROWSING, "adjust weights"));
                        break;
                    case InteractionEventType.EXAMINE:
                        actions.push(new VbsAction(VbsActionType.BROWSING, "examine object"));
                        break;
                    case InteractionEventType.BROWSE:
                        actions.push(new VbsAction(VbsActionType.BROWSING, "browse results"));
                        break;
                    default:
                        break;
                }
            });
            return actions;
        }).catch((e,o) => {
            console.log("An error occurred when mapping an event from the event stream to a VbsAction: " +  e.message);
            return o;
        }).filter(e => e.length > 0)
    }
}
