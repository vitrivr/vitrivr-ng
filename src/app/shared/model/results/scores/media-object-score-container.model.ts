import {ScoreContainer} from './compound-score-container.model';
import {SegmentScoreContainer} from './segment-score-container.model';
import {MediaObject} from '../../media/media-object.model';
import {MediaSegment} from '../../media/media-segment.model';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {FusionFunction} from '../fusion/weight-function.interface';
import {MediaType} from '../../media/media-type.model';
import { StringDoublePair } from 'app/core/openapi';

/**
 * The MediaObjectScoreContainer is a ScoreContainer for MediaObjects.
 * It corresponds to a single MediaObject (e.g. a video, audio or 3d-model file) and holds the score for that object.
 * That score is determined by the scores of the SegmentScoreContainers hosted by a concrete instance of this class.
 */
export class MediaObjectScoreContainer extends ScoreContainer implements MediaObject {
  /** Type of the MediaObject. */
  public mediatype: MediaType;
  /** Name of the MediaObject. */
  public name: string;
  /** Path of the MediaObject. */
  public path: string;
  /** Content URL pointing to the media file. */
  public contentURL: string;
  /** Map of SegmentScoreContainer for all the SegmentObject's that belong to this MediaObject. */
  private _segmentScores: Map<string, SegmentScoreContainer> = new Map();
  /** A internal caching structures for Feature <-> Similarity paris that do not have a SegmentScoreContainer yet.  string is containerId*/
  private _cache: Map<string, Array<[WeightedFeatureCategory, StringDoublePair, number]>> = new Map();

  /**
   * Default constructor.
   *
   * @param objectId
   */
  public constructor(public readonly objectId: string) {
    super();
  }

  /** List of SegmentScoreContainer that belong to this MediaObjectScoreContainer. */
  private _segments: SegmentScoreContainer[] = [];

  /**
   *
   * @return {SegmentScoreContainer[]}
   */
  get segments(): SegmentScoreContainer[] {
    return this._segments;
  }

  /** Map containing the metadata that belongs to the object. Can be empty! */
  private _metadata: Map<string, string> = new Map();

  /**
   * Returns the map of metadata.
   *
   * @return {Map<string, string>}
   */
  get metadata() {
    return this._metadata;
  }

  /**
   * Method used by the UI/Template part. Can be used to determine whether this MediaObjectScoreContainer
   * is ready to be displayed.
   *
   * @returns {boolean} true if it can be displayed, false otherwise.
   */
  get show(): boolean {
    return (this.mediatype && this._segmentScores.size > 0);
  }

  /**
   * Number of segments that were retrieved for the current MediaObjectScoreContainer
   *
   * @returns {MediaObject}
   */
  get numberOfSegments(): number {
    return this._segmentScores.size;
  }

  /**
   * Getter for the most representative segment.
   *
   * @returns {SegmentScoreContainer}
   */
  get representativeSegment(): SegmentScoreContainer {
    return this.segments.reduce((a, b) => {
      return a.score > b.score ? a : b
    });
  }

  /**
   * Adds a MediaSegment to the MediaObjectContainer. That Segment is actually not added to the container itself but
   * to the respective SegmentScoreContainer (contained in {segmentScores})
   *
   * @param segment MediaSegment to add.
   */
  public addMediaSegment(segment: MediaSegment): SegmentScoreContainer {
    const ssc = this.uniqueSegmentScoreContainer(segment);
    if (this._cache.has(ssc.segmentId)) {
      this._cache.get(ssc.segmentId).forEach(v => {
        this.addSimilarity(v[0], v[1], v[2])
      });
      this._cache.delete(ssc.segmentId)
    }
    return ssc;
  }

  /**
   * Adds a similarity entry to the MediaObjectContainer.
   *
   * @param category The category for which to add the similarity entry.
   * @param similarity The actual similarity entry.
   * @param containerId The query container id this similarity corresponds to
   */
  public addSimilarity(category: WeightedFeatureCategory, similarity: StringDoublePair, containerId: number) {
    if (this._segmentScores.has(similarity.key)) {
      this._segmentScores.get(similarity.key).addSimilarity(category, similarity, containerId);
    } else if (this._cache.has(similarity.key)) {
      this._cache.get(similarity.key).push([category, similarity, containerId]);
    } else {
      this._cache.set(similarity.key, []);
      this._cache.get(similarity.key).push([category, similarity, containerId]);
    }
  }

  /**
   * Updates the score of this MediaObjectScoreContainer.
   *
   * @param features List of feature categories that should be used to calculate the score.
   * @param func The weightPercentage function that should be used to calculate the score.
   */
  public update(features: WeightedFeatureCategory[], func: FusionFunction) {
    this._score = func.scoreForObject(features, this);
  }

  /**
   * Returns a metadata entry for the given key.
   *
   * @param key Key for the metadata entry to lookup.
   */
  public metadataForKey(key: string) {
    return this._metadata.get(key);
  }

  /**
   * Serializes this MediaObjectScoreContainer into a plan JavaScript object.
   */
  public serialize(): MediaObject {
    return <MediaObject>{
      objectId: this.objectId,
      mediatype: this.mediatype,
      name: this.name,
      path: this.path,
      contentURL: this.contentURL
    }
  }

  /**
   * Returns a unique SegmentScoreContainer instance for the provided segmentId. That is, if a SegmentScoreContainer
   * has been created and registered with the MediaObjectScoreContainer for the provided segmentId, that instance is returned.
   * Otherwise, a new instance is created and registered.
   *
   * @param {string} segment MediaSegment for which to create a SegmentScoreContainer.
   * @return {SegmentScoreContainer}
   */
  private uniqueSegmentScoreContainer(segment: MediaSegment): SegmentScoreContainer {
    if (!this._segmentScores.has(segment.segmentId)) {
      const ssc = new SegmentScoreContainer(segment, this);
      this._segmentScores.set(segment.segmentId, ssc);
      this._segments.push(ssc);
    }
    return this._segmentScores.get(segment.segmentId);
  }
}
