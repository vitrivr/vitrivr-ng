import {MediaType} from '../../media/media-type.model';
import {FusionFunction} from '../fusion/weight-function.interface';
import {DefaultFusionFunction} from '../fusion/default-fusion-function.model';
import {MediaObjectScoreContainer} from './media-object-score-container.model';
import {SegmentScoreContainer} from './segment-score-container.model';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {ObjectQueryResult} from '../../messages/interfaces/responses/query-result-object.interface';
import {SegmentQueryResult} from '../../messages/interfaces/responses/query-result-segment.interface';
import {SimilarityQueryResult} from '../../messages/interfaces/responses/query-result-similarty.interface';
import {BehaviorSubject, Observable} from 'rxjs';
import {FeatureCategories} from '../feature-categories.model';
import {MediaObject} from '../../media/media-object.model';
import {SegmentMetadataQueryResult} from '../../messages/interfaces/responses/query-result-segment-metadata.interface';
import {ObjectMetadataQueryResult} from '../../messages/interfaces/responses/query-result-object-metadata.interface';
import {MediaSegment} from '../../media/media-segment.model';
import {Similarity} from '../../media/similarity.model';
import {MediaObjectMetadata} from '../../media/media-object-metadata.model';
import {MediaSegmentMetadata} from '../../media/media-segment-metadata.model';
import 'rxjs-compat/add/operator/map';
import 'rxjs-compat/add/operator/merge';
import 'rxjs-compat/add/operator/concat';
import 'rxjs-compat/add/operator/zip';
import {FilterService} from '../../../../core/queries/filter.service';
import 'rxjs-compat/add/operator/filter';
import 'rxjs-compat/add/operator/combineLatest';

export class ResultsContainer {
  /** A Map that maps objectId's to their MediaObjectScoreContainer. This is where the results of a query are assembled. */
  private _objectid_to_object_map: Map<string, MediaObjectScoreContainer> = new Map();

  /** A Map that maps segmentId's to objectId's. This is a cache-structure! */
  private _segmentid_to_segment_map: Map<string, SegmentScoreContainer> = new Map();

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
  private _mediatypes: Map<MediaType, boolean> = new Map();

  /** A subject that can be used to publish changes to the results. */
  private _results_objects_subject: BehaviorSubject<MediaObjectScoreContainer[]> = new BehaviorSubject(this._results_objects);

  /** A subject that can be used to publish changes to the results. */
  private _results_segments_subject: BehaviorSubject<SegmentScoreContainer[]> = new BehaviorSubject(this._results_segments);

  /** A subject that can be used to publish changes to the results. */
  private _results_features_subject: BehaviorSubject<WeightedFeatureCategory[]> = new BehaviorSubject(this._features);

  /**
   * Constructor for ResultsContainer.
   *
   * @param {string} queryId Unique ID of the query. Used to filter messages!
   * @param {FusionFunction} weightFunction Function that should be used to calculate the scores.
   * @param _filterService used to check which metadata should be displayed
   */
  constructor(public readonly queryId: string, private weightFunction: FusionFunction = new DefaultFusionFunction()) {
  }

  /**
   * Returns the number of objects contained in this ResultsContainer.
   */
  get objectCount(): number {
    return this._results_objects.length;
  }

  /**
   * Returns the number of segments contained in this ResultsContainer.
   */
  get segmentCount(): number {
    return this._results_segments.length;
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
  get mediatypes(): Map<MediaType, boolean> {
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
   * @param _filterService only get metadata which are even possible after applying the filters
   * @return a map of all metadata keys with all possible values
   */
  public metadataAsObservable(_filterService: FilterService): Observable<Map<string, Set<string>>> {
    return this.segmentsAsObservable.map(resultList => {
      const map: Map<string, Set<string>> = new Map();
      resultList.forEach(res => {
        res.metadata.forEach(((mdValue, mdKey) => map.has(mdKey) ? map.get(mdKey).add(mdValue) : map.set(mdKey, new Set<string>().add(mdValue))))
      });
      return map;
    }).combineLatest(this._results_objects_subject, function (map, objects) {
      objects.forEach(res => {
        res.metadata.forEach((mdValue, mdKey) => {
          map.has(mdKey) ? map.get(mdKey).add(mdValue) : map.set(mdKey, new Set<string>().add(mdValue))
        })
      });
      return map;
    })
  }

  get featuresAsObservable(): Observable<WeightedFeatureCategory[]> {
    return this._results_features_subject.asObservable();
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
    if (!features) {
      features = this.features;
    }
    if (!weightFunction) {
      weightFunction = this.weightFunction;
    }
    console.time(`Rerank (${this.queryId})`);
    this._results_objects.forEach((value) => {
      value.update(features, weightFunction);
    });
    /* Other methods calling rerank() depend on this next() call */
    this.next();
    console.timeEnd(`Rerank (${this.queryId})`);
  }

  /**
   * Processes a ObjectQueryResult message. Extracts the MediaObject lines and adds the
   * objects to the list of MediaObjectScoreContainers.
   *
   * @param {ObjectQueryResult} obj ObjectQueryResult message
   * @return {boolean} True, if ObjectQueryResult was processed i.e. queryId corresponded with that of the score container.
   */
  public processObjectMessage(obj: ObjectQueryResult): boolean {
    if (obj.queryId !== this.queryId) {
      return false;
    }
    for (const object of obj.content) {
      /* Add mediatype of object to list of available mediatypes (if new). */
      if (!this._mediatypes.has(object.mediatype)) {
        this._mediatypes.set(object.mediatype, true);
      }

      /* Get unique MediaObjectScore container and apply MediaObject. */
      this.uniqueMediaObjectScoreContainer(object.objectId, object);
    }

    /* Re-rank on the UI side - this also invokes next(). */
    this.rerank();

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
    if (seg.queryId !== this.queryId) {
      console.warn('query result id ' + seg.queryId + ' does not match query id ' + this.queryId);
      return false;
    }
    for (const segment of seg.content) {
      const mosc = this.uniqueMediaObjectScoreContainer(segment.objectId);
      const ssc = mosc.addMediaSegment(segment);
      if (!this._segmentid_to_segment_map.has(segment.segmentId)) {
        this._results_segments.push(ssc);
        this._segmentid_to_segment_map.set(segment.segmentId, ssc);
      }
    }

    /* Re-rank on the UI side - this also invokes next(). */
    this.rerank();

    /* Return true. */
    return true;
  }

  /**
   * Processes a SegmentMetadataQueryResult message. Extracts the metadata and attaches it to the respective SegmentScoreContainer.
   *
   * @param met SegmentMetadataQueryResult that should be processed.
   */
  public processSegmentMetadataMessage(met: SegmentMetadataQueryResult): boolean {
    if (met.queryId !== this.queryId) {
      console.warn('segment metadata result id ' + met.queryId + ' does not match query id ' + this.queryId);
      return false;
    }
    for (const metadata of met.content) {
      const ssc = this._segmentid_to_segment_map.get(metadata.segmentId);
      if (ssc) {
        ssc.metadata.set(`${metadata.domain}.${metadata.key}`, metadata.value)
      }
    }

    this.next()
  }

  /**
   * Processes a ObjectMetadataQueryResult message. Extracts the metadata and attaches it to the respective MediaObjectScoreContainer.
   *
   * @param met ObjectMetadataQueryResult that should be processed.
   */
  public processObjectMetadataMessage(met: ObjectMetadataQueryResult): boolean {
    if (met.queryId !== this.queryId) {
      console.warn('object metadata result id ' + met.queryId + ' does not match query id ' + this.queryId);
      return false;
    }
    for (const metadata of met.content) {
      const ssc = this._objectid_to_object_map.get(metadata.objectId);
      if (ssc) {
        ssc.metadata.set(`${metadata.domain}.${metadata.key}`, metadata.value)
      }
    }

    this.next()
  }

  /**
   * Processes the SimilarityQueryResult message. Registers the feature (if new) and updates the scores
   * of all the affected MediaObjectScoreContainers.
   *
   * @param sim SimilarityQueryResult message
   * @return {boolean} True, if SimilarityQueryResult was processed i.e. queryId corresponded with that of the message.
   */
  public processSimilarityMessage(sim: SimilarityQueryResult) {
    if (sim.queryId !== this.queryId) {
      console.warn('similarity query result id ' + sim.queryId + ' does not match query id ' + this.queryId);
      return false;
    }

    /* Get and (if missing) add a unique feature. */
    const feature = this.uniqueFeature(sim.category);

    /* Updates the Similarity lines and re-calculates the scores.  */
    for (const similarity of sim.content) {
      const segment = this._segmentid_to_segment_map.get(similarity.key);
      if (segment != undefined) {
        segment.addSimilarity(feature, similarity);
      }
    }

    /* Re-rank the results (calling this method also causes an invocation of next(). */
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
  }

  /**
   * Publishes the next rounds of changes by pushing the filtered array to the respective subjects.
   */
  private next() {
    console.debug('publishing next round of changes with ' + this._results_segments.length + ' segments and ' + this._results_objects.length + ' objects');
    this._results_segments_subject.next(this._results_segments.filter(v => v.objectScoreContainer.show)); /* Filter segments that are not ready. */
    this._results_objects_subject.next(this._results_objects.filter(v => v.show));
    this._results_features_subject.next(this._features);
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
    for (const feature of this._features) {
      if (feature.name === category) {
        return feature;
      }
    }
    const feature = new WeightedFeatureCategory(category, category, 100);
    this._features.push(feature);
    return feature;
  }


  /**
   * Serializes this ResultsContainer into a plain JavaScript object.
   */
  public serialize() {
    return {
      queryId: this.queryId,
      objects: this._results_objects.map(obj => obj.serialize()),
      segments: this._results_segments.map(seg => seg.serialize()),
      objectMetadata: this._results_objects.map(obj => {
        const metadata: MediaObjectMetadata[] = [];
        obj.metadata.forEach((k, v) => {
          metadata.push({objectId: obj.objectId, domain: k.split('.')[0], key: k.split('.')[1], value: v})
        });
        return metadata;
      }).reduce((x, y) => x.concat(y), []),
      segmentMetadata: this._results_segments.map(seg => {
        const metadata: MediaSegmentMetadata[] = [];
        seg.metadata.forEach((k, v) => {
          metadata.push({segmentId: seg.segmentId, domain: k.split('.')[0], key: k.split('.')[1], value: v})
        });
        return metadata;
      }).reduce((x, y) => x.concat(y), []),
      similarity: this.features.map(f => {
        return this._results_segments.filter(seg => seg.scores.has(f)).map(seg => {
          return <Similarity>{category: f.name, key: seg.segmentId, value: seg.scores.get(f)};
        });
      })
    };
  }

  /**
   * Deserializes a plain JavaScript object into a ResultsContainer. Only works with JavaScript objects that have been generated using
   * ResultsContainer#serialize().
   */
  public static deserialize(data: any): ResultsContainer {
    const container = new ResultsContainer(data['queryId']);
    container.processObjectMessage(<ObjectQueryResult>{queryId: container.queryId, content: <MediaObject[]>data['objects']});
    container.processSegmentMessage(<SegmentQueryResult>{queryId: container.queryId, content: <MediaSegment[]>data['segments']});
    container.processObjectMetadataMessage(<ObjectMetadataQueryResult>{
      queryId: container.queryId,
      content: <MediaObjectMetadata[]>data['objectMetadata']
    });
    container.processSegmentMetadataMessage(<SegmentMetadataQueryResult>{
      queryId: container.queryId,
      content: <MediaSegmentMetadata[]>data['segmentMetadata']
    });
    for (const similiarity of data['similarity']) {
      if (similiarity.length > 0) {
        container.processSimilarityMessage(<SimilarityQueryResult>{
          queryId: container.queryId,
          category: similiarity[0].category,
          content: similiarity
        });
      }
    }
    return container;
  }
}
