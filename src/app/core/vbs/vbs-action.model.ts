import {Observable} from "rxjs/Observable";
import {InteractionEventType} from "../../shared/model/events/interaction-event-type.model";
import {InteractionEvent} from "../../shared/model/events/interaction-event.model";
import {WeightedFeatureCategory} from "../../shared/model/results/weighted-feature-category.model";

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
    EXTERNAL = "T",
    BROWSING = "B",
    RESET = "X"
}


export class VbsAction {

    /** Separator used to connect two VbsActions. */
    public static SEPARATOR = ";";

    /** Prefix used for the tool ID. */
    public static TOOL_ID_PREFIX = "VTR";

    /**
     * Default constructor for VbsAction.
     *
     * @param {VbsActionType} action The type of action.
     * @param {number} timestamp The timestamp of the VbsAction.
     * @param {string} context Optional context information.
     */
    constructor(public readonly action: VbsActionType, public readonly timestamp: number, public readonly context?: string) {}

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
                        actions.push(new VbsAction(VbsActionType.AUDIO, e.timestamp));
                        break;
                    case InteractionEventType.QUERY_MOTION:
                        actions.push(new VbsAction(VbsActionType.MOTIONSKETCH, e.timestamp));
                        break;
                    case InteractionEventType.MLT:
                        actions.push(new VbsAction(VbsActionType.SIMILARITY, e.timestamp, c.context.get("q:value")));
                        break;
                    case InteractionEventType.QUERY_TAG:
                        actions.push(new VbsAction(VbsActionType.KEYWORD, e.timestamp, c.context.get("q:value")));
                        break;
                    case InteractionEventType.QUERY_FULLTEXT: {
                        let categories = c.context.get("q:categories");
                        if (categories.indexOf("tagft") > -1 || categories.indexOf("meta") > -1) actions.push(new VbsAction(VbsActionType.KEYWORD, e.timestamp, c.context.get("q:value")));
                        if (categories.indexOf("ocr") > -1) actions.push(new VbsAction(VbsActionType.OCR, e.timestamp, c.context.get("q:value")));
                        if (categories.indexOf("asr") > -1) actions.push(new VbsAction(VbsActionType.AUDIO, e.timestamp,c.context.get("q:value") + ",asr"));
                        break;
                    }
                    case InteractionEventType.QUERY_IMAGE: {
                        let categories = c.context.get("q:categories");
                        if (categories.indexOf("globalcolor") > -1 || c.context.get("q:categories").indexOf("localcolor") > -1) actions.push(new VbsAction(VbsActionType.COLORSKETCH, e.timestamp));
                        if (categories.indexOf("edge") > -1) actions.push(new VbsAction(VbsActionType.EDGESKETCH,e.timestamp));
                        if (categories.indexOf("localfeatures") > -1) actions.push(new VbsAction(VbsActionType.SIMILARITY, e.timestamp));
                        break;
                    }
                    case InteractionEventType.FILTER:
                        actions.push(new VbsAction(VbsActionType.FILTERING,e.timestamp));
                        break;
                    case InteractionEventType.REFINE:
                        let weights = c.context.get("w:weights").map((v: WeightedFeatureCategory) => v.name + ":" + v.weight/100).join(",");
                        actions.push(new VbsAction(VbsActionType.BROWSING, e.timestamp, "adjust weights," + weights));
                        break;
                    case InteractionEventType.EXAMINE:
                        actions.push(new VbsAction(VbsActionType.BROWSING, e.timestamp, c.context.get("i:mediasegment") + ",examine"));
                        break;
                    case InteractionEventType.BROWSE:
                        actions.push(new VbsAction(VbsActionType.BROWSING, e.timestamp, "browse results"));
                        break;
                    case InteractionEventType.CLEAR:
                        actions.push(new VbsAction(VbsActionType.RESET, e.timestamp));
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
