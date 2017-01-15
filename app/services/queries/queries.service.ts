import {Injectable} from "@angular/core";
import {AbstractWebsocketService} from "../websocket.interface";
import {Configuration} from "../../configuration/app.config";
import {QueryContainer, Query} from "../../types/query.types";
import {
    QueryResult, SimilarityQueryResult, ObjectQueryResult, SegmentQueryResult,
    Message, QueryStart
} from "../../types/messages.types";
import {MediaType} from "../../types/media.types";
import {
    MediaObjectScoreContainer
} from "../../types/containers";

@Injectable()
export class QueryService extends AbstractWebsocketService<QueryResult> {
    /** A Map that maps objectId's to their MediaObjectScoreContainer. This is where the results of a query are assembled. */
    public similarities : Map<string,MediaObjectScoreContainer> = new Map();

    /** A Map that maps segmentId's to objectId's. This is a cache-structure. */
    private segment_to_object_map : Map<string,string> = new Map();

    /** ID that identifies an ongoing query. If it's null, then no query is ongoing. */
    private queryId : string = null;

    /**
     * Default constructor.
     *
     * @param _configuration Gets injected by DI.
     */
    constructor(_configuration : Configuration) {
        super(_configuration, 'find/object/similar');
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
     * Starts a new query - success is indicated by the return value.
     *
     * Note: Queries can only be started if no query is ongoing.
     *
     * @param query
     * @returns {boolean} true if query was issued, false otherwise.
     */
    public query(query : Query) : boolean {
        if (this.queryId == null) {
            this.send(query);
            return true;
        } else {
            return false;
        }
    }

    /**
     *  Starts a new Query in response to a QR_START message. Stores the
     *  queryId for further reference and purges the similarities and segment_to_object_map.
     *
     * @param id ID of the new query. Used to associate responses.
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
    onSocketMessage(message: string): void {
        let parsed = <Message>JSON.parse(message);
        switch (parsed.type) {
            case "QR_START":
                let qs = <QueryStart>parsed;
                this.startNewQuery(qs.queryId);
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
                break;
            case "QR_OBJECT":
                let obj = <ObjectQueryResult>parsed;
                if (obj.queryId == this.queryId) {
                    for (let object of obj.content) {
                        if (!this.similarities.has(object.objectId)) this.similarities.set(object.objectId, new MediaObjectScoreContainer());
                            this.similarities.get(object.objectId).mediaObject = object;
                    }
                }
                break;
            case "QR_END":
                this.finalizeQuery();
                break;
        }
        if (this.onServiceNext != undefined) this.onServiceNext(message);
    }
}




