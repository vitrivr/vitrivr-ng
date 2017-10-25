import {MediaType} from "../../media/media-type.model";
import {WeightFunction} from "../weighting/weight-function.interface";
import {DefaultWeightFunction} from "../weighting/default-weight-function.model";
import {MediaObjectScoreContainer} from "./media-object-score-container.model";
import {SegmentScoreContainer} from "./segment-score-container.model";
import {Feature} from "../feature.model";
import {ObjectQueryResult} from "../../messages/interfaces/query-result-object.interface";
import {SegmentQueryResult} from "../../messages/interfaces/query-result-segment.interface";
import {SimilarityQueryResult} from "../../messages/interfaces/query-result-similarty.interface";
import {Subject} from "rxjs/Subject";

export class ResultsContainer extends Subject<boolean> {
    /**
     * Map of all MediaTypes that have been returned by the current query. Empty map indicates, that no
     * results have been returned yet OR that no query is running.
     *
     * Boolean indicates whether the query type is active (i.e. should be returned) or inactive (i.e. should
     * be filtered).
     */
    private _mediatypes: Map<MediaType,boolean> = new Map();

    /** A Map that maps objectId's to their MediaObjectScoreContainer. This is where the results of a query are assembled. */
    private _objectid_to_object_map : Map<string,MediaObjectScoreContainer> = new Map();

    /** A Map that maps segmentId's to objectId's. This is a cache-structure! */
    private _segmentid_to_objectid_map : Map<string,string> = new Map();

    /** Internal data structure that contains all MediaObjectScoreContainers. */
    private _results_objects: MediaObjectScoreContainer[] = [];

    /** Internal data structure that contains all SegmentScoreContainers. */
    private _results_segments: SegmentScoreContainer[] = [];

    /** List of all the features that were returned and hence are known to the results container. */
    private _features: Feature[] = [];

    /**
     * Constructor for ResultsConatiner.
     *
     * @param {string} queryId Unique ID of the query. Used to filter messages!
     * @param {WeightFunction} weightFunction Function that should be used to calculate the scores.
     */
    constructor(public readonly queryId: string, private weightFunction : WeightFunction = new DefaultWeightFunction()) {
        super();
    }

    /**
     * Getter for the list of MediaObjectScoreContainers in this ResultsContainer.
     *
     * @return {MediaObjectScoreContainer[]}
     */
    get objects() {
        return this._results_objects.filter(value => {
            return value.show && this._mediatypes.get(value.mediatype)
        });
    }

    /**
     *
     * @param {string} objectId
     * @return {boolean}
     */
    public hasObject(objectId: string) {
        return this._objectid_to_object_map.has(objectId);
    }

    /**
     *
     * @param {string} objectId
     * @return {boolean}
     */
    public getObject(objectId: string) {
        return this._objectid_to_object_map.get(objectId);
    }

    /**
     * Getter for the list of SegmentScoreContainer in this ResultsContainer.
     *
     * @return {SegmentScoreContainer[]}
     */
    get segments() {
        return this._results_segments.filter(value => {
            return value.objectScoreContainer.show && this._mediatypes.get(value.objectScoreContainer.mediatype);
        });
    }

    /**
     * Getter for the list of features.
     *
     * @returns {Feature[]}
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
            this.next(true);
        }
    }

    /**
     * Re-ranks the objects and segments, i.e. calculates new scores, using the provided list of
     * features and weight function. If none are provided, the default ones define in the ResultsContainer
     * are used.
     *
     * @param {Feature[]} features
     * @param {WeightFunction} weightFunction
     */
    public rerank(features?: Feature[], weightFunction?: WeightFunction) {
        if (!features) features = this.features;
        if (!weightFunction) weightFunction = this.weightFunction;
        this._results_objects.forEach((value) => { value.update(features, weightFunction); });

        /* Publish a change. */
        this.next(true);
    }

    /**
     * Processes a ObjectQueryResult message. Extracts the MediaObject lines and adds the
     * objects to the list of MediaObjectScoreContainers.
     *
     * @param {ObjectQueryResult} obj ObjectQueryResult message
     * @return {boolean} True, if ObjectQueryResult was processed i.e. queryId corresponded with that of the score container.
     */
    public processObjectMessage(obj: ObjectQueryResult): boolean {
        if (obj.queryId !== this.queryId) return false;
        for (let object of obj.content) {
            /* Add mediatype of object to list of available mediatypes (if new). */
            if (!this._mediatypes.has(object.mediatype)) this._mediatypes.set(object.mediatype, true);

            /* Get unique MediaObjectScore container and apply MediaObject. */
            let mosc = this.uniqueMediaObjectScoreContainer(object.objectId);
            mosc.mediaObject = object;
        }

        /* Publish a change. */
        this.next(true);

        /* Return true. */
        return true;
    }

    /**
     * Processes a SegmentQueryResult message. Extracts the Segment lines and adds the
     * segments to the existing MediaObjectScoreContainers.
     *
     * This method triggers an observable change in the QueryService class.
     *
     * @param seg SegmentQueryResult message
     * @return {boolean} True, if SegmentQueryResult was processed i.e. queryId corresponded with that of the message.
     */
    public processSegmentMessage(seg: SegmentQueryResult): boolean {
        if (seg.queryId !== this.queryId) return false;
        for (let segment of seg.content) {
            let mosc = this.uniqueMediaObjectScoreContainer(segment.objectId);
            let ssc = mosc.addMediaSegment(segment);
            if (!this._segmentid_to_objectid_map.has(segment.segmentId)) {
                this._results_segments.push(ssc);
                this._segmentid_to_objectid_map.set(segment.segmentId, segment.objectId);
            }
        }

        /* Publish a change. */
        this.next(true);

        /* Return true. */
        return true;
    }



    /**
     * Processes the SimilarityQueryResult message. Registers the feature (if new) and updates the scores
     * of all the affected MediaObjectScoreContainers.
     *
     * @param sim SimilarityQueryResult message
     * @return {boolean} True, if SimilarityQueryResult was processed i.e. queryId corresponded with that of the message.
     */
    public processSimilarityMessage(sim : SimilarityQueryResult) {

        if (sim.queryId !== this.queryId) return false;

        /* Get and (if missing) add a unique feature. */
        let feature = this.uniqueFeature(sim.category);

        /* Updates the Similarity lines and re-calculates the scores.  */
        for (let similarity of sim.content) {
            let objectId = this._segmentid_to_objectid_map.get(similarity.key);
            if (objectId != undefined) {
                let mosc = this.uniqueMediaObjectScoreContainer(objectId);
                mosc.addSimilarity(feature, similarity);
            }
        }

        /* Rerank the results. */
        this.rerank();

        /* Publish a change. */
        this.next(true);

        /* Return true. */
        return true;
    }

    /**
     * Returns a unique MediaObjectScoreContainer instance for the provided objectId. That is, if a MediaObjectScoreContainer
     * has been created and registered with the ResultsContainer for the provided objectId, that instance is returned. Otherwise,
     * a new instance is created and registered.
     *
     * @param {string} objectId ID of the MediaObject for which to create a MediaObjectScoreContainer.
     * @return {MediaObjectScoreContainer}
     */
    private uniqueMediaObjectScoreContainer(objectId: string): MediaObjectScoreContainer {
        if (this._objectid_to_object_map.has(objectId)) {
            return this._objectid_to_object_map.get(objectId);
        } else {
            let mosc = new MediaObjectScoreContainer(objectId);
            this._objectid_to_object_map.set(objectId, mosc);
            this._results_objects.push(mosc);
            return mosc;
        }
    }

    /**
     *
     * @param {string} category
     * @return {Feature}
     */
    private uniqueFeature(category: string): Feature {
        for (let feature of this._features) {
            if (feature.name == category) return feature;
        }
        let feature = new Feature(category, category, 100);
        this._features.push(feature);
        return feature;
    }
}