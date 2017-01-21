import {Injectable} from "@angular/core";
import {CineastAPI} from "../api/cineast-api.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {MediaObjectScoreContainer} from "./media-object-score-container.model";
import {MediaType} from "../../shared/model/media/media-object.model";
import {Message} from "../../shared/model/messages/interfaces/message.interface";
import {QueryStart} from "../../shared/model/messages/interfaces/query-start.interface";
import {SegmentQueryResult} from "../../shared/model/messages/interfaces/query-result-segment.interface";
import {SimilarityQueryResult} from "../../shared/model/messages/interfaces/query-result-similarty.interface";
import {ObjectQueryResult} from "../../shared/model/messages/interfaces/query-result-object.interface";
import {QueryContainer} from "../../shared/model/queries/query-container.model";
import {Query} from "../../shared/model/messages/query.model";



export type QueryChange = "NONE" | "STARTED" | "ENDED" | "UPDATED";

@Injectable()
export class QueryService {
    /** A Map that maps objectId's to their MediaObjectScoreContainer. This is where the results of a research are assembled. */
    public similarities : Map<string,MediaObjectScoreContainer> = new Map();

    /** A Map that maps segmentId's to objectId's. This is a cache-structure. */
    private segment_to_object_map : Map<string,string> = new Map();

    /** ID that identifies an ongoing research. If it's null, then no research is ongoing. */
    private queryId : string = null;

    /** */
    private weights: Map<string,number>;

    /** */
    private stateSubject : BehaviorSubject<QueryChange> = new BehaviorSubject("NONE" as QueryChange);

    /**
     * Default constructor.
     *
     * @param _api Reference to the CineastAPI. Gets injected by DI.
     */
    constructor(private _api : CineastAPI) {
        _api.observable()
            .filter(msg => ["QR_START","QR_END","QR_SIMILARITY","QR_OBJECT", "QR_SEGMENT"].indexOf(msg[0]) > -1)
            .subscribe((msg) => this.onApiMessage(msg[1]));
        console.log("QueryService is up and running!");
    }

    /**
     *
     * @param types
     * @param containers
     * @returns {Query}
     */
    public buildQuery(types: MediaType[], containers: QueryContainer[]) {
        let query = new Query();
        for (let container of containers) {
            query.containers.push(container);
        }
        for (let type of types) {
            query.types.push(type);
        }
        return query;
    }



    /**
     * Starts a new research - success is indicated by the return value.
     *
     * Note: Queries can only be started if no research is currently ongoing.
     *
     * @param query
     * @returns {boolean} true if research was issued, false otherwise.
     */
    public query(query : Query) : boolean {
        if (this.queryId == null) {
            this._api.send(query);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns an Observable that allows an Observer to be notified about
     * state changes in the QueryService (Started, Ended, Resultset updated).
     *
     * @returns {Observable<T>}
     */
    public observable() : Observable<QueryChange>{
        return this.stateSubject.asObservable();
    }

    /**
     *  Starts a new Query in response to a QR_START message. Stores the
     *  queryId for further reference and purges the similarities and segment_to_object_map.
     *
     * @param id ID of the new research. Used to associate responses.
     */
    private startNewQuery(id : string) {
        this.similarities.clear();
        this.segment_to_object_map.clear();
        this.queryId = id;
    }

    /**
     * Finalizes a running Query by setting the queryId field to null. Does
     * some cleanup.
     */
    private finalizeQuery() {
        this.queryId = null;
        this.segment_to_object_map.clear();
    }

    /**
     * This is where the magic happens: Subscribes to messages from the underlying WebSocket and orchestrates the
     * assembly of the individual pieces of QueryResults.
     *
     * @param message
     */
    private onApiMessage(message: string): void {
        let parsed = <Message>JSON.parse(message);
        switch (parsed.messagetype) {
            case "QR_START":
                let qs = <QueryStart>parsed;
                this.startNewQuery(qs.queryId);
                this.stateSubject.next("STARTED" as QueryChange);
                break;
            case "QR_SEGMENT":
                let seg = <SegmentQueryResult>parsed;
                if (seg.queryId == this.queryId) {
                    for (let segment of seg.content) {
                        if (!this.similarities.has(segment.objectId)) this.similarities.set(segment.objectId, new MediaObjectScoreContainer());
                        this.similarities.get(segment.objectId).addMediaSegment(segment);
                        this.segment_to_object_map.set(segment.segmentId, segment.objectId);
                    }
                }
                this.stateSubject.next("UPDATED" as QueryChange);
                break;
            case "QR_SIMILARITY":
                let sim = <SimilarityQueryResult>parsed;
                if (sim.queryId == this.queryId) {
                    for (let similarity of sim.content) {
                        let objectId = this.segment_to_object_map.get(similarity.key);
                        if (objectId != undefined) {
                            if (!this.similarities.has(objectId)) this.similarities.set(objectId, new MediaObjectScoreContainer());
                            this.similarities.get(objectId).addSimilarity(sim.category, similarity);
                        }
                    }
                }
                this.stateSubject.next("UPDATED" as QueryChange);
                break;
            case "QR_OBJECT":
                let obj = <ObjectQueryResult>parsed;
                if (obj.queryId == this.queryId) {
                    for (let object of obj.content) {
                        if (!this.similarities.has(object.objectId)) this.similarities.set(object.objectId, new MediaObjectScoreContainer());
                            this.similarities.get(object.objectId).mediaObject = object;
                    }
                }
                this.stateSubject.next("UPDATED" as QueryChange);
                break;
            case "QR_END":
                this.finalizeQuery();
                this.stateSubject.next("ENDED" as QueryChange);
                break;
        }
    }
}




