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
import {Feature} from "../../shared/model/features/feature.model";
import {QueryContainerInterface} from "../../shared/model/queries/interfaces/query-container.interface";


/** Types of changes that can be emitted from the QueryService.
 *
 *  NONE        - No change, this is required due to the way BehaviorSubjects work
 *  STARTED     - New query was started.
 *  ENDED       - Processing of the query has ended.
 *  UPDATED     - New information concerning the running query is available.
 *  FEATURE     - A new feature has become available.
 */
export type QueryChange = "NONE" | "STARTED" | "ENDED" | "UPDATED" | "FEATURE";

/**
 * This service orchestrates similarity queries using the Cineast API (WebSocket). The service is responsible for
 * issuing query requests, processing incoming responses and ranking of the queries.
 */
@Injectable()
export class QueryService {
    /** A Map that maps objectId's to their MediaObjectScoreContainer. This is where the results of a research are assembled. */
    public results : Map<string,MediaObjectScoreContainer> = new Map();

    /** A Map that maps segmentId's to objectId's. This is a cache-structure. */
    private segment_to_object_map : Map<string,string> = new Map();

    /** ID that identifies an ongoing research. If it's null, then no research is ongoing. */
    private queryId : string = null;

    /** List of all the features that are used the current query and hence known to the service. */
    private features: Map<string,Feature> = new Map();

    /** BehaviorSubject that allows Observers to subscribe to changes emmited from the QueryService. */
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
    public buildQuery(types: MediaType[], containers: QueryContainerInterface[]) {
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
     * Returns the Map of features.
     *
     * @returns {Map<string, number>}
     */
    public getFeatures() : Map<string,Feature> {
        return this.features;
    }

    /**
     * Causes the scores for all MediaObjects to be re-calculated.
     *
     * This method triggers an observable change in the QueryService class.
     */
    public rerank() : void {
        this.results.forEach((value) => {
            value.update();
        });
        this.stateSubject.next("FEATURE");
        this.stateSubject.next("UPDATED");
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
                break;
            case "QR_OBJECT":
                let obj = <ObjectQueryResult>parsed;
                if (obj.queryId == this.queryId) this.processObjectMessage(obj);
                break;
            case "QR_SEGMENT":
                let seg = <SegmentQueryResult>parsed;
                if (seg.queryId == this.queryId) this.processSegmentMessage(seg);
                break;
            case "QR_SIMILARITY":
                let sim = <SimilarityQueryResult>parsed;
                if (sim.queryId == this.queryId) this.processSimilarityMessage(sim);
                break;
            case "QR_END":
                this.finalizeQuery();
                break;
        }
    }

    /**
     * Starts a new Query in response to a QR_START message. Stores the
     * queryId for further reference and purges the similarities and segment_to_object_map.
     *
     * This method triggers an observable change in the QueryService class.
     *
     * @param id ID of the new research. Used to associate responses.
     */
    private startNewQuery(id : string) {
        this.results.clear();
        this.segment_to_object_map.clear();
        this.queryId = id;
        this.features.clear();
        this.stateSubject.next("STARTED" as QueryChange);
    }

    /**
     * Processes a ObjectQueryResult message. Extracts the MediaObject information and adds the
     * objects to the list of MediaObjectScoreContainers.
     *
     * This method triggers an observable change in the QueryService class.
     *
     * @param seg ObjectQueryResult message
     */
    private processObjectMessage(obj: ObjectQueryResult) {
        for (let object of obj.content) {
            if (!this.results.has(object.objectId)) this.results.set(object.objectId, new MediaObjectScoreContainer());
            this.results.get(object.objectId).mediaObject = object;
        }

        /* Inform Observers about changes. */
        this.stateSubject.next("UPDATED" as QueryChange);
    }

    /**
     * Processes a SegmentQueryResult message. Extracts the Segment information and adds the
     * segments to the existing MediaObjectScoreContainers.
     *
     * This method triggers an observable change in the QueryService class.
     *
     * @param seg SegmentQueryResult message
     */
    private processSegmentMessage(seg: SegmentQueryResult) {
        for (let segment of seg.content) {
            if (!this.results.has(segment.objectId)) this.results.set(segment.objectId, new MediaObjectScoreContainer());
            this.results.get(segment.objectId).addMediaSegment(segment);
            this.segment_to_object_map.set(segment.segmentId, segment.objectId);
        }

        /* Inform Observers about changes. */
        this.stateSubject.next("UPDATED" as QueryChange);
    }

    /**
     * Processes the SimilarityQueryResult message. Registers the feature (if new) and
     * updates the scores of all the affected MediaObjectScoreContainers.
     *
     * This method triggers an observable change in the QueryService class.
     *
     * @param sim SimilarityQueryResult message
     */
    private processSimilarityMessage(sim : SimilarityQueryResult) {
        /* Add feature to the list of features. */
        let feature: Feature = this.addFeatureForCategory(sim.category);

        /* Updates the Similarity information and re-calculates the scores.  */
        for (let similarity of sim.content) {
            let objectId = this.segment_to_object_map.get(similarity.key);
            if (objectId != undefined) {
                if (!this.results.has(objectId)) this.results.set(objectId, new MediaObjectScoreContainer());
                this.results.get(objectId).addSimilarity(feature, similarity);
                this.results.get(objectId).update();
            }
        }

        /* Inform Observers about changes. */
        this.stateSubject.next("UPDATED" as QueryChange);
    }

    /**
     * Finalizes a running Query by setting the queryId field to null. Does
     * some cleanup.
     *
     * This method triggers an observable change in the QueryService class.
     */
    private finalizeQuery() {
        this.queryId = null;
        this.segment_to_object_map.clear();
        this.stateSubject.next("ENDED" as QueryChange);
    }

    /**
     * Creates a new Feature object for a named category. The method makes sure that for any given
     * category only a single Feature object is instantiated and returned.
     *
     * This method triggers an observable change in the QueryService class.
     *
     * @param category Name of the feature category.
     * @return Feature object for the named category.
     */
    private addFeatureForCategory(category : string) : Feature {
        if (!this.features.has(category)) {
            this.features.set(category, new Feature(category, category, 100, 100));
        }
        this.stateSubject.next("FEATURE");
        return this.features.get(category);
    }
}




