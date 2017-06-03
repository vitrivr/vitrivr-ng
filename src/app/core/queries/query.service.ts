import {Injectable} from "@angular/core";
import {CineastAPI} from "../api/cineast-api.service";
import {Observable} from "rxjs/Observable";
import {MediaObjectScoreContainer} from "../../shared/model/features/scores/media-object-score-container.model";
import {Message} from "../../shared/model/messages/interfaces/message.interface";
import {QueryStart} from "../../shared/model/messages/interfaces/query-start.interface";
import {SegmentQueryResult} from "../../shared/model/messages/interfaces/query-result-segment.interface";
import {SimilarityQueryResult} from "../../shared/model/messages/interfaces/query-result-similarty.interface";
import {ObjectQueryResult} from "../../shared/model/messages/interfaces/query-result-object.interface";
import {SimilarityQuery} from "../../shared/model/messages/similarity-query.model";
import {Feature} from "../../shared/model/features/feature.model";
import {WeightFunction} from "../../shared/model/features/weighting/weight-function.interface";
import {DefaultWeightFunction} from "../../shared/model/features/weighting/default-weight-function.model";
import {Subject} from "rxjs/Subject";
import {MoreLikeThisQuery} from "../../shared/model/messages/more-like-this-query.model";
import {MediaType} from "../../shared/model/media/media-type.model";
import {QueryError} from "../../shared/model/messages/interfaces/query-error.interface";


/**
 *  Types of changes that can be emitted from the QueryService.
 *
 *  STARTED     - New query was started.
 *  ENDED       - Processing of the query has ended.
 *  UPDATED     - New information concerning the running query is available OR post-execution refinements were performed.
 *  FEATURE     - A new feature has become available.
 */
export type QueryChange = "STARTED" | "ENDED" | "ERROR" | "UPDATED" | "FEATURE" | "CLEAR";

/**
 * This service orchestrates similarity queries using the Cineast API (WebSocket). The service is responsible for
 * issuing findSimilar requests, processing incoming responses and ranking of the queries.
 */
@Injectable()
export class QueryService {

    /** A Map that maps objectId's to their MediaObjectScoreContainer. This is where the results of a query are assembled. */
    private results : Map<string,MediaObjectScoreContainer> = new Map();

    /** A Map that maps segmentId's to objectId's. This is a cache-structure! */
    private segment_to_object_map : Map<string,string> = new Map();

    /** ID that identifies an ongoing research. If it's null, then no research is ongoing. */
    private _queryId : string = null;

    /** Flag indicating whether a query is currently being executed. */
    private _running : boolean = false;

    /** List of all the refinement that were used by the current findSimilar() and hence known to the service. */
    private _features: Feature[] = [];

    /**
     * Map of all mediatypes that have been returned by the current query. Empty map indicates, that no
     * results have been returned yet OR that no query is running.
     *
     * Boolean indicates whether the query type is active (i.e. should be returned) or inactive (i.e. should
     * be filtered).
     */
    private _mediatypes: Map<MediaType,boolean> = new Map();

    /** BehaviorSubject that allows Observers to subscribe to changes emitted from the QueryService. */
    private _stateSubject : Subject<QueryChange> = new Subject();

    /**
     * Reference to the WeightFunction that's being used with the current instance of QueryService. WeightFunctions are used
     * to rank results based on their score.
     */
    private weightFunction : WeightFunction = new DefaultWeightFunction();

    /**
     * Default constructor.
     *
     * @param _api Reference to the CineastAPI. Gets injected by DI.
     */
    constructor(private _api : CineastAPI) {
        _api.observable()
            .filter(msg => ["QR_START","QR_END","QR_ERROR","QR_SIMILARITY","QR_OBJECT", "QR_SEGMENT"].indexOf(msg[0]) > -1)
            .subscribe((msg) => this.onApiMessage(msg[1]));
        console.log("QueryService is up and running!");
    }

    /**
     * Starts a new similarity query. Success is indicated by the return value.
     *
     * Note: Queries can only be started if no query is currently ongoing.
     *
     * @param query The SimilarityQueryMessage.
     * @returns {boolean} true if query was issued, false otherwise.
     */
    public findSimilar(query : SimilarityQuery) : boolean {
        if (!this._running) {
            this._api.send(query);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Starts a new MoreLikeThis query. Success is indicated by the return value.
     *
     * Note: Queries can only be started if no query is currently ongoing.
     *
     * @param segmentId The ID of the segment that should serve as example.
     * @returns {boolean} true if query was issued, false otherwise.
     */
    public findMoreLikeThis(segmentId: string) : boolean {
        if (this._running) return false;
        if (this._features.length == 0) return false;

        let categories: string[] = [];
        for (let feature of this._features) {
            categories.push(feature.name);
        }

        this._api.send(new MoreLikeThisQuery(segmentId, categories));
        return true;
    }

    /**
     * Returns the number of available results. If this methods returns 0, no
     * results are available.
     *
     * @returns {number}
     */
    public size() : number {
        return this.results.size;
    }

    /**
     * Returns true, if the results map contains the specified objectId and
     * false otherwise.
     *
     * @param objectId The ID of the desired object.
     * @returns {number}
     */
    public has(objectId: string) : boolean {
        return this.results.has(objectId);
    }

    /**
     * Returns the value of the the item in the results map or null,
     * if no item exists of the specified key.
     *
     * @param objectId The ID of the desired object.
     * @returns {number}
     */
    public get(objectId: string) : MediaObjectScoreContainer {
        return this.results.get(objectId);
    }

    /**
     * Applies the provided callback function to the resultset. The callback will only be
     * applied to results that a) are ready to be displayed and b) have not been filtered
     * by the filter settings.
     *
     * This is the preferred way to access the results in the result-set. Be aware, that they
     * results are not sorted.
     *
     * @param callback Callback function that should be applied.
     * @param filtered Indicates whether or not to honour the MediaType filters. Defaults to true.
     */
    public forEach(callback: (value: MediaObjectScoreContainer, key: string) => any, filtered: boolean = true) {
        this.results.forEach((value, key) => {
            if (filtered && value.show && this._mediatypes.get(value.mediatype)) {
                callback(value, key);
            } else if (!filtered && value.show) {
                callback(value, key);
            }
        });
    }

    /**
     * Causes the scores for all MediaObjects to be re-calculated.
     *
     * This method triggers an observable change in the QueryService class.
     */
    public rerank() : void {
        this.results.forEach((value) => {
            value.update(this._features, this.weightFunction);
        });
        this._stateSubject.next("UPDATED");
    }

    /**
     * Changes the filter attribute for the provided mediatype. If the mediatype is unknwon
     * to the QueryService, this method has no effect.
     *
     * Invocation of this method triggers an observable change in the QueryService class, if
     * the filter-status of a MediaType actually changes.
     *
     * @param type MediaType that should be changed.
     * @param active New filter status. True = is visible, false = will be filtered
     */
    public toggleMediatype(type: MediaType, active: boolean) {
        if (this._mediatypes.has(type) && this._mediatypes.get(type) != active) {
            this._mediatypes.set(type, active);
            this._stateSubject.next("UPDATED");
        }
    }

    /**
     * Getter for QueryID.
     *
     * @return {string}
     */
    get queryId(): string {
        return this._queryId;
    }

    /**
     * Getter for running.
     *
     * @return {boolean}
     */
    get running(): boolean {
        return this._running;
    }

    /**
     * Returns an Observable that allows an Observer to be notified about
     * state changes in the QueryService (RunningQueries, Finished, Resultset updated).
     *
     * @returns {Observable<QueryChange>}
     */
    get observable() : Observable<QueryChange>{
        return this._stateSubject.asObservable();
    }

    /**
     * Getter for the Map of refinement.
     *
     * @returns {Map<string, number>}
     */
    get features(): Feature[] {
        return this._features;
    }

    /**
     * Getter for the list of mediatypes.
     *
     * @return {Map<MediaType, boolean>}
     */
    get mediatypes() : Map<MediaType,boolean> {
        return this._mediatypes;
    }

    /**
     * Clears the QueryService and removes all results.
     */
    public clear() {
        this.results.clear();
        this._mediatypes.clear();
        this.segment_to_object_map.clear();
        this._features.length = 0;
        this._running = false;
        this._stateSubject.next("CLEAR");
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
                if (obj.queryId == this._queryId) this.processObjectMessage(obj);
                break;
            case "QR_SEGMENT":
                let seg = <SegmentQueryResult>parsed;
                if (seg.queryId == this._queryId) this.processSegmentMessage(seg);
                break;
            case "QR_SIMILARITY":
                let sim = <SimilarityQueryResult>parsed;
                if (sim.queryId == this._queryId) this.processSimilarityMessage(sim);
                break;
            case "QR_ERROR":
                this.errorOccurred(<QueryError>parsed);
                break;
            case "QR_END":
                this.finalizeQuery();
                break;
        }
    }

    /**
     * Starts a new RunningQueries in response to a QR_START message. Stores the
     * queryId for further reference and purges the similarities and segment_to_object_map.
     *
     * This method triggers an observable change in the QueryService class.
     *
     * @param id ID of the new research. Used to associate responses.
     */
    private startNewQuery(id : string) {
        /* Clears the QueryService. */
        this.clear();

        /* Start the actual query. */
        this._queryId = id;
        this._running = true;
        this._stateSubject.next("STARTED" as QueryChange);
    }

    /**
     * Processes a ObjectQueryResult message. Extracts the MediaObject information and adds the
     * objects to the list of MediaObjectScoreContainers.
     *
     * This method triggers an observable change in the QueryService class.
     *
     * @param obj ObjectQueryResult message
     */
    private processObjectMessage(obj: ObjectQueryResult) {
        for (let object of obj.content) {
            if (object) {
                /* Check if object's mediatype is already known to the service. Otherwise, add it. */
                if (!this._mediatypes.has(object.mediatype)) this._mediatypes.set(object.mediatype, true);

                /* Complete the resultset. */
                if (!this.results.has(object.objectId)) this.results.set(object.objectId, new MediaObjectScoreContainer(object.objectId));
                this.results.get(object.objectId).mediaObject = object;
            }
        }

        /* Inform Observers about changes. */
        this._stateSubject.next("UPDATED" as QueryChange);
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
            if (!this.results.has(segment.objectId)) this.results.set(segment.objectId, new MediaObjectScoreContainer(segment.objectId));
            this.results.get(segment.objectId).addMediaSegment(segment);
            this.segment_to_object_map.set(segment.segmentId, segment.objectId);
        }

        /* Inform Observers about changes. */
        this._stateSubject.next("UPDATED" as QueryChange);
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
        /* Add feature to the list of refinement. */
        let feature: Feature = this.addFeatureForCategory(sim.category);

        /* Updates the Similarity information and re-calculates the scores.  */
        for (let similarity of sim.content) {
            let objectId = this.segment_to_object_map.get(similarity.key);
            if (objectId != undefined) {
                if (!this.results.has(objectId)) this.results.set(objectId, new MediaObjectScoreContainer(objectId));
                this.results.get(objectId).addSimilarity(feature, similarity);
            }
        }

        /* Re-rank the results. */
        this.rerank();
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
        for (let feature of this._features) {
            if (feature.name == category) return feature;
        }
        let feature = new Feature(category, category, 100);
        this._features.push(feature);
        this._stateSubject.next("FEATURE");
        return feature;
    }

    /**
     * Finalizes a running RunningQueries and does some cleanup.
     *
     * This method triggers an observable change in the QueryService class.
     */
    private finalizeQuery() {
        this.segment_to_object_map.clear();
        this._running = false;
        this._stateSubject.next("ENDED" as QueryChange);
    }

    /**
     * Finalizes a running RunningQueries and does some cleanup after an error was reported by Cineast.
     *
     * This method triggers an observable change in the QueryService class.
     */
    private errorOccurred(message: QueryError) {
        this.segment_to_object_map.clear();
        this._running = false;
        this._stateSubject.next("ERROR" as QueryChange);
        console.log("QueryService received error: " + message.message);
    }
}




