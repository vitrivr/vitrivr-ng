import {FusionFunction} from '../fusion/weight-function.interface';
import {MediaObjectScoreContainer} from './media-object-score-container.model';
import {MediaSegmentScoreContainer} from './segment-score-container.model';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {SimilarityQueryResult} from '../../messages/interfaces/responses/query-result-similarty.interface';
import {BehaviorSubject, Observable} from 'rxjs';
import {FeatureCategories} from '../feature-categories.model';
import {SegmentMetadataQueryResult} from '../../messages/interfaces/responses/query-result-segment-metadata.interface';
import {ObjectMetadataQueryResult} from '../../messages/interfaces/responses/query-result-object-metadata.interface';
import {MediaSegmentMetadata} from '../../media/media-segment-metadata.model';
import 'rxjs-compat/add/operator/map';
import 'rxjs-compat/add/operator/merge';
import 'rxjs-compat/add/operator/concat';
import 'rxjs-compat/add/operator/zip';
import 'rxjs-compat/add/operator/filter';
import 'rxjs-compat/add/operator/combineLatest';
import {AbstractRefinementOption} from '../../../../settings/refinement/refinementoption.model';
import {CheckboxRefinementModel} from '../../../../settings/refinement/checkboxrefinement.model';
import {SliderRefinementModel} from '../../../../settings/refinement/sliderrefinement.model';
import {Config} from '../../config/config.model';
import {FilterType} from '../../../../settings/refinement/filtertype.model';
import {TemporalFusionFunction} from '../fusion/temporal-fusion-function.model';
import {AverageFusionFunction} from '../fusion/average-fusion-function.model';
import {MaxpoolFusionFunction} from '../fusion/maxpool-fusion-function.model';
import {MediaObjectMetadataDescriptor, MediaObjectQueryResult, MediaSegmentDescriptor, MediaSegmentQueryResult, StringDoublePair} from '../../../../../../openapi/cineast';
import {AppConfig} from '../../../../app.config';
import {MediaObjectDescriptor} from '../../../../../../openapi/cineast/model/mediaObjectDescriptor';

export class ResultsContainer {
  /** A Map that maps objectId's to their MediaObjectScoreContainer. This is where the results of a query are assembled. */
  private _objectid_to_object_map: Map<string, MediaObjectScoreContainer> = new Map();

  /** A Map that maps segmentId's to objectId's. This is a cache-structure! */
  private _segmentid_to_segment_map: Map<string, MediaSegmentScoreContainer> = new Map();

  /** Internal data structure that contains all MediaObjectScoreContainers. */
  private _results_objects: MediaObjectScoreContainer[] = [];

  /** Internal data structure that contains all SegmentScoreContainers. */
  private _results_segments: MediaSegmentScoreContainer[] = [];
  /** A subject that can be used to publish changes to the results. */
  private _results_objects_subject: BehaviorSubject<MediaObjectScoreContainer[]> = new BehaviorSubject(this._results_objects);
  /** A subject that can be used to publish changes to the results. */
  private _results_segments_subject: BehaviorSubject<MediaSegmentScoreContainer[]> = new BehaviorSubject(this._results_segments);

  /** A counter for rerank() requests. So we don't have to loop over all objects and segments many times per second. */
  private _rerank = 0;
  /** A counter for next() requests. So we don't have to loop over all objects and segments many times per second. */
  private _next = 0;

  /** List of all the results that were returned and hence are known to the results container. */
  private _features: WeightedFeatureCategory[] = [];

  /** A subject that can be used to publish changes to the results. */
  private _results_features_subject: BehaviorSubject<WeightedFeatureCategory[]> = new BehaviorSubject(this._features);

  /**
   * Map of all MediaTypes that have been returned by the current query. Empty map indicates, that no
   * results have been returned yet OR that no query is running.
   *
   * Boolean indicates whether the query type is active (i.e. should be returned) or inactive (i.e. should
   * be filtered).
   */
  private _mediatypes: Map<MediaObjectDescriptor.MediatypeEnum, boolean> = new Map();

  /**
   * Constructor for ResultsContainer.
   *
   * @param {string} queryId Unique ID of the query. Used to filter messages!
   * @param {FusionFunction} scoreFunction Function that should be used to calculate the scores.
   */
  constructor(public readonly queryId: string, private scoreFunction: FusionFunction = TemporalFusionFunction.instance()) {
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
  get mediatypes(): Map<MediaObjectDescriptor.MediatypeEnum, boolean> {
    return this._mediatypes;
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

  get mediaobjectsAsObservable(): Observable<MediaObjectScoreContainer[]> {
    return this._results_objects_subject.asObservable()
  }

  get segmentsAsObservable(): Observable<MediaSegmentScoreContainer[]> {
    return this._results_segments_subject.asObservable();
  }

  get featuresAsObservable(): Observable<WeightedFeatureCategory[]> {
    return this._results_features_subject.asObservable();
  }

  /**
   * Deserializes a plain JavaScript object into a ResultsContainer. Only works with JavaScript objects that have been generated using
   * ResultsContainer#serialize().
   */
  // tslint:disable-next-line:member-ordering
  public static deserialize(data: any): ResultsContainer {
    const container = new ResultsContainer(data['queryId']);
    container.processObjectMessage(<MediaObjectQueryResult>{queryId: container.queryId, content: <MediaObjectDescriptor[]>data['objects']});
    container.processSegmentMessage(<MediaSegmentQueryResult>{queryId: container.queryId, content: <MediaSegmentDescriptor[]>data['segments']});
    container.processObjectMetadataMessage(<ObjectMetadataQueryResult>{
      queryId: container.queryId,
      content: <MediaObjectMetadataDescriptor[]>data['objectMetadata']
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
          containerId: similiarity.containerId,
          content: similiarity
        });
      }
    }
    return container;
  }

  // tslint:disable-next-line:member-ordering
  private static fillMap(map: Map<string, AbstractRefinementOption>, resultList: any, config?: Config) {
    if (config) {
      config.get<[string, string][]>('refinement.filters').forEach(el => {
        switch (el[1]) {
          case 'CHECKBOX':
            map.set(el[0], new CheckboxRefinementModel(new Set<string>()));
            break;
          case 'SLIDER':
            map.set(el[0], new SliderRefinementModel(0, 0));
            break;
          default:
            console.error('unknown filter type: ' + el[1]);
            break;
        }

      });
    }
    resultList.forEach(res => {
      res.metadata.forEach(((mdValue, mdKey) => {
        if (!map.has(mdKey)) {
          return
        }
        switch (map.get(mdKey).type) {
          case FilterType.CHECKBOX:
            (map.get(mdKey) as CheckboxRefinementModel).options.add(mdValue);
            break;
          case FilterType.SLIDER:
            const slider = map.get(mdKey) as SliderRefinementModel;
            const num = Number(mdValue);
            if (!num && num !== 0) {
              console.error(mdValue + ' is not a number so it cannot be used for category ' + mdKey)
            }
            if (num < slider.min) {
              slider.min = num
            }
            if (num > slider.max) {
              slider.max = num
            }
            break;
          default:
            console.error('unknown type: ' + map.get(mdKey).type)
        }
      }))
    });
    return map;
  }

  /**
   * Check if the results should be reranked. This is done in order to avoid updating the frontend too often.
   */
  public checkUpdate() {
    if (this._rerank > 0) {
      // check upper limit to avoid call in avalanche of responses
      // we only rerank if there have been less than 100 calls in the last window
      if (this._rerank < 100) {
        this.rerank();
      } else { // mark unranked changes for next round
        this._rerank = 1;
      }
      return
    }
    if (this._next > 0) {
      // check upper limit to avoid call in avalanche of responses
      if (this._next < 100) {
        this.next();
      } else { // mark unpublished changes for next round
        this._next = 1;
      }
    }
  }

  /**
   * force update if there are changes, e.g. on query end
   */
  public doUpdate() {
    if (this._rerank > 0) {
      this.rerank();
    } else if (this._next > 0) { // else if as rerank already calls next
      this.next();
    }
  }

  public setScoreFunction(scoreFunction: string) {
    switch (scoreFunction.toUpperCase()) {
      case 'TEMPORAL':
        this.scoreFunction = TemporalFusionFunction.instance();
        break;
      case 'AVERAGE':
        this.scoreFunction = new AverageFusionFunction();
        break;
      case 'MAXPOOL':
        this.scoreFunction = new MaxpoolFusionFunction();
        break;
    }
    this.rerank()
  }

  public hasObject(objectId: string) {
    return this._objectid_to_object_map.has(objectId);
  }

  public getObject(objectId: string): MediaObjectScoreContainer {
    return this._objectid_to_object_map.get(objectId);
  }

  /**
   * @param _configService used to determine filter type for metadata
   * @return a map of all metadata keys with all possible values
   */
  public metadataAsObservable(_configService: AppConfig): Observable<Map<string, AbstractRefinementOption>> {

    return this.segmentsAsObservable.combineLatest(_configService.configAsObservable, function (resultList, config) {
      const map: Map<string, AbstractRefinementOption> = new Map();
      return ResultsContainer.fillMap(map, resultList, config)
    }).combineLatest(this._results_objects_subject, function (map, objects) {
      return ResultsContainer.fillMap(map, objects)
    })
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
  public toggleMediatype(type: MediaObjectDescriptor.MediatypeEnum, active: boolean) {
    if (this._mediatypes.has(type)) {
      this._mediatypes.set(type, active);
    }
    this.next();
  }

  /**
   * Re-ranks the objects and segments, i.e. calculates new scores, using the provided list of
   * results and weightPercentage function. If none are provided, the default ones define in the ResultsContainer
   * are used.
   *
   * @param {WeightedFeatureCategory[]} features
   * @param {FusionFunction} weightFunction
   */
  public rerank(features?: WeightedFeatureCategory[], weightFunction?: FusionFunction) {
    this._rerank = 0;
    if (!features) {
      console.debug(`no features given for rerank(), using features inherent to the results container: ${this.features}`);
      features = this.features;
    }
    if (!weightFunction) {
      console.debug(`no weight function given for rerank(), using weight function inherent to the results container: ${this.scoreFunction.name()}`);
      weightFunction = this.scoreFunction;
    }

    console.time(`Rerank (${this.queryId})`);


    this._results_objects.forEach((mediaObject) => {
      mediaObject.update(features, weightFunction);
      mediaObject.segments.forEach((segment) => {
        segment.update(features, weightFunction);
      });
    });


    /* Other methods calling rerank() depend on this next() call */
    this.next();
    console.timeEnd(`Rerank (${this.queryId})`);
  }

  /**
   * Processes a ObjectQueryResult message. Extracts the MediaObject lines and adds the
   * objects to the list of MediaObjectScoreContainers.
   *
   * @param {MediaObjectQueryResult} obj ObjectQueryResult message
   * @return {boolean} True, if ObjectQueryResult was processed i.e. queryId corresponded with that of the score container.
   */
  public processObjectMessage(obj: MediaObjectQueryResult): boolean {
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
    this._rerank += 1;

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
  public processSegmentMessage(seg: MediaSegmentQueryResult): boolean {
    if (seg.queryId !== this.queryId) {
      console.warn('query result id ' + seg.queryId + ' does not match query id ' + this.queryId);
      return false;
    }
    console.time(`Processing Segment Message (${this.queryId})`);
    for (const segment of seg.content) {
      const mosc = this.uniqueMediaObjectScoreContainer(segment.objectId);
      const ssc = mosc.addMediaSegment(segment);
      if (!this._segmentid_to_segment_map.has(segment.segmentId)) {
        this._results_segments.push(ssc);
        this._segmentid_to_segment_map.set(segment.segmentId, ssc);
      }
    }
    console.timeEnd(`Processing Segment Message (${this.queryId})`);

    /* Re-rank on the UI side - this also invokes next(). */
    this._rerank += 1;

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

    console.time(`Processing Segment Metadata Message (${this.queryId})`);

    for (const metadata of met.content) {
      const ssc = this._segmentid_to_segment_map.get(metadata.segmentId);
      if (ssc) {
        ssc.metadata.set(`${metadata.domain}.${metadata.key}`, metadata.value);
      }
    }
    console.timeEnd(`Processing Segment Metadata Message (${this.queryId})`);

    this._next += 1;
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
    console.time(`Processing Object Metadata Message (${this.queryId})`);
    for (const metadata of met.content) {
      const mosc = this._objectid_to_object_map.get(metadata.objectId);
      if (mosc) {
        mosc.metadata.set(`${metadata.domain}.${metadata.key}`, metadata.value);
      }
    }
    console.timeEnd(`Processing Object Metadata Message (${this.queryId})`);

    this._next += 1;
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
      console.warn(`similarity result query id ${sim.queryId} does not match query id ${this.queryId}`);
      return false;
    }

    /* Get and (if missing) add a unique feature. */
    const feature = this.uniqueFeature(sim.category);

    /* Updates the Similarity lines and re-calculates the scores.  */
    for (const similarity of sim.content) {
      const segment = this._segmentid_to_segment_map.get(similarity.key);
      if (segment !== undefined) {
        segment.addSimilarity(feature, similarity, sim.containerId);
      }
    }


    /* Re-rank the results (calling this method also causes an invocation of next(). */
    this._rerank += 1;
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
   * Flattens arrays with any level of nesting.
   *
   * @param arr The nested arrays to flatten.
   * @return {any[]} An one dimensional array consisting of all objects found in the input arrays.
   */
  public flatten(arr, result = []) {
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      if (Array.isArray(value)) {
        this.flatten(value, result);
      } else {
        result.push(value);
      }
    }
    return result;
  }

  /**
   * Serializes this ResultsContainer into a plain JavaScript object.
   */
  public serialize() {
    const similarityList = [];
    this._results_segments.forEach(seg => {
      seg.scores.forEach((categoryMap, containerId) => {
        categoryMap.forEach((score, category) => {
          similarityList.push(<StringDoublePair>{category: category.name, key: seg.segmentId, value: score, containerId: containerId})
        })
      });
    });
    return {
      queryId: this.queryId,
      objects: this._results_objects.map(obj => obj.serialize()),
      segments: this._results_segments.map(seg => seg.serialize()),
      objectMetadata: this.flatten(this._results_objects.map(obj => {
        const metadata: MediaObjectMetadataDescriptor[] = [];
        obj.metadata.forEach((v, k) => {
          metadata.push({objectId: obj.objectId, domain: k.split('.')[0], key: k.split('.')[1], value: v})
        });
        return metadata;
      })),
      segmentMetadata: this.flatten(this._results_segments.map(seg => {
        const metadata: MediaSegmentMetadata[] = [];
        seg.metadata.forEach((v, k) => {
          metadata.push({segmentId: seg.segmentId, domain: k.split('.')[0], key: k.split('.')[1], value: v})
        });
        return metadata;
      })),
      similarity: similarityList
    };
  }

  /**
   * Publishes the next rounds of changes by pushing the filtered array to the respective subjects.
   */
  private next() {
    this._next = 0;
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
  private uniqueMediaObjectScoreContainer(objectId: string, object?: MediaObjectDescriptor): MediaObjectScoreContainer {
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
    for (const _feature of this._features) {
      if (_feature.name === category) {
        return _feature;
      }
    }
    const feature = new WeightedFeatureCategory(category, category, 100);
    this._features.push(feature);
    return feature;
  }
}
