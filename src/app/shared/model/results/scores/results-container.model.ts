import {MediaType} from "../../media/media-type.model";
import {FusionFunction} from "../fusion/weight-function.interface";
import {DefaultFusionFunction} from "../fusion/default-fusion-function.model";
import {MediaObjectScoreContainer} from "./media-object-score-container.model";
import {SegmentScoreContainer} from "./segment-score-container.model";
import {WeightedFeatureCategory} from "../weighted-feature-category.model";
import {ObjectQueryResult} from "../../messages/interfaces/responses/query-result-object.interface";
import {SegmentQueryResult} from "../../messages/interfaces/responses/query-result-segment.interface";
import {SimilarityQueryResult} from "../../messages/interfaces/responses/query-result-similarty.interface";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs";
import {FeatureCategories} from "../feature-categories.model";
import {MediaObject} from "../../media/media-object.model";

export class ResultsContainer {
    /** A Map that maps objectId's to their MediaObjectScoreContainer. This is where the results of a query are assembled. */
    private _objectid_to_object_map : Map<string,MediaObjectScoreContainer> = new Map();

    /** A Map that maps segmentId's to objectId's. This is a cache-structure! */
    private _segmentid_to_objectid_map : Map<string,string> = new Map();

    /** Internal data structure that contains all MediaObjectScoreContainers. */
    private _results_objects: MediaObjectScoreContainer[] = [];

    /** Internal data structure that contains all SegmentScoreContainers. */
    private _results_segments: SegmentScoreContainer[] = [];

    /** List of all the results that were returned and hence are known to the results container. */
    private _features: WeightedFeatureCategory[] = [];

    /**
     * Map of all MediaTypes that have been returned by the current query. Empty map indicates, that no
     * results have been returned yet OR that no query is running.
     *
     * Boolean indicates whether the query type is active (i.e. should be returned) or inactive (i.e. should
     * be filtered).
     */
    private _mediatypes: Map<MediaType,boolean> = new Map();

    /**
     * List of metadata filters that should be applied to segments. Each entry { key => value } causes a check as to
     * whether the metadata item with the provided key has the provided value. In order to be displayed in the final
     * result set, a MediaSegmentScoreContainer must pass at least one of these checks
     */
    private _segment_filters: [string, string][] = [];

    /**
     * List of metadata filters that should be applied to objects. Each entry { key => value } causes a check as to
     * whether the metadata item with the provided key has the provided value. In order to be displayed in the final
     * result set, a MediaObjectScoreContainer must pass at least one of these checks
     */
    private _object_filters: [string, string][] = [];

    /** A subject that can be used to publish changes to the results. */
    private _results_objects_subject: BehaviorSubject<MediaObjectScoreContainer[]> = new BehaviorSubject(this._results_objects);

    /** A subject that can be used to publish changes to the results. */
    private _results_segments_subject: BehaviorSubject<SegmentScoreContainer[]> = new BehaviorSubject(this._results_segments);

    /** A subject that can be used to publish changes to the results. */
    private _results_features_subject: BehaviorSubject<WeightedFeatureCategory[]> = new BehaviorSubject(this._features);

    /** A subject that can be used to publish changes to the results. */
    private _results_types_subject: BehaviorSubject<Map<MediaType,boolean>> = new BehaviorSubject(this._mediatypes);

    /**
     * Constructor for ResultsContainer.
     *
     * @param {string} queryId Unique ID of the query. Used to filter messages!
     * @param {FusionFunction} weightFunction Function that should be used to calculate the scores.
     */
    constructor(public readonly queryId: string, private weightFunction : FusionFunction = new DefaultFusionFunction()) {}

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
     * Getter for the list of results.
     *
     * @returns {WeightedFeatureCategory[]}
     */
    get features(): WeightedFeatureCategory[] {
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
     *
     * @return {Subscription<MediaObjectScoreContainer[]>}
     */
    get mediaobjectsAsObservable(): Observable<MediaObjectScoreContainer[]> {
        return this._results_objects_subject.asObservable()
    }

    /**
     *
     * @return {Subscription<MediaObjectScoreContainer[]>}
     */
    get segmentsAsObservable(): Observable<SegmentScoreContainer[]> {
        return this._results_segments_subject.asObservable();
    }

    /**
     *
     */
    get featuresAsObservable(): Observable<WeightedFeatureCategory[]> {
        return this._results_features_subject.asObservable();
    }

    /**
     *
     */
    get mediatypesAsObservable(): Observable<Map<MediaType,boolean>> {
        return this._results_types_subject.asObservable();
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
        if (this._mediatypes.has(type)) {
            this._mediatypes.set(type, active);
        }
        this.next();
    }

    /**
     * Re-ranks the objects and segments, i.e. calculates new scores, using the provided list of
     * results and weight function. If none are provided, the default ones define in the ResultsContainer
     * are used.
     *
     * @param {WeightedFeatureCategory[]} features
     * @param {FusionFunction} weightFunction
     */
    public rerank(features?: WeightedFeatureCategory[], weightFunction?: FusionFunction) {
        if (!features) features = this.features;
        if (!weightFunction) weightFunction = this.weightFunction;
        this._results_objects.forEach((value) => { value.update(features, weightFunction); });

        /* Publish a change. */
        this.next();
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
            this.uniqueMediaObjectScoreContainer(object.objectId, object);
        }

        /* Publish a change. */
        this.next();

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
        this.next();

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

        /* Rerank the results (calling this method also causes an invokation of next(). */
        this.rerank();

        /* Return true. */
        return true;
    }

    /**
     * Completes the two subjects and invalidates them thereby.
     */
    public complete() {
        this._results_objects_subject.complete();
        this._results_segments_subject.complete();
        this._results_features_subject.complete();
        this._results_types_subject.complete();
    }

    /**
     * Publishes the next rounds of changes by pushing the filtered array to the respective subjects.
     */
    private next() {
        this._results_segments_subject.next(this._results_segments
            .filter(v => v.objectScoreContainer.show) /* Filter segments that are not ready. */
            .filter(v => this._mediatypes.get(v.objectScoreContainer.mediatype)) /* Filter segments of types that have been toggled by the user. */
            //.filter(v => this._segment_filters.map(f => f[1] == v.metadataForKey(f[0])).reduce((v1,v2,idx) => (idx == 0 ? false : v1 || v2), true)) /* Filter segments that don't match any of the filter criteria. */
        );

        this._results_objects_subject.next(this._results_objects
            .filter(v => v.show)
            .filter(v => this._mediatypes.get(v.mediatype) == true)
            //.filter(v => this._object_filters.map(f => f[1] == v.metadataForKey(f[0])).reduce((v1,v2,idx) => (idx == 0 ? false : v1 || v2), true)) /* Filter segments that don't match any of the filter criteria. */
        );


        this._results_features_subject.next(this._features);
        this._results_types_subject.next(this._mediatypes);
    }


    /**
     * Returns a unique MediaObjectScoreContainer instance for the provided objectId. That is, if a MediaObjectScoreContainer
     * has been created and registered with the ResultsContainer for the provided objectId, that instance is returned. Otherwise,
     * a new instance is created and registered.
     *
     * @param {string} objectId ID of the MediaObject for which to create a MediaObjectScoreContainer.
     * @param {MediaObject} object The optional MediaObject. If set, the properties of the unique MediaObjectScoreContainer are updated.
     * @return {MediaObjectScoreContainer}
     */
    private uniqueMediaObjectScoreContainer(objectId: string, object?: MediaObject): MediaObjectScoreContainer {
        let mosc;
        if (this._objectid_to_object_map.has(objectId)) {
            mosc = this._objectid_to_object_map.get(objectId);
        } else {
            mosc = new MediaObjectScoreContainer(objectId);
            this._objectid_to_object_map.set(objectId, mosc);
            this._results_objects.push(mosc);
        }

        /* Optional: Update MediaObjectScoreContainer. */
        if (object && object.objectId === object.objectId) {
            mosc.mediatype = object.mediatype;
            mosc.name = object.name;
            mosc.path = object.path;
            mosc.contentURL = object.contentURL;
        }

        return mosc;
    }

    /**
     * Returns a unique Feature instance for the provided category name. That is, if a Feature has been created and registered with the
     * ResultsContainer for the provided category, that instance is returned. Otherwise, a new instance is created and registered.
     *
     * @param {string} category
     * @return {WeightedFeatureCategory}
     */
    private uniqueFeature(category: FeatureCategories): WeightedFeatureCategory {
        for (let feature of this._features) {
            if (feature.name == category) return feature;
        }
        let feature = new WeightedFeatureCategory(category, category, 100);
        this._features.push(feature);
        return feature;
    }
}