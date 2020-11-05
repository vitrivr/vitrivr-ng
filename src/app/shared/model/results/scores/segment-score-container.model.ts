import {ScoreContainer} from './compound-score-container.model';
import {FusionFunction} from '../fusion/weight-function.interface';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {MediaSegment} from '../../media/media-segment.model';
import {MediaObjectScoreContainer} from './media-object-score-container.model';
import {StringDoublePair} from 'app/core/openapi';

/**
 * The SegmentScoreContainer is a ScoreContainer for MediaSegments. It is associated with
 * a single segment (e.g. a shot of a video) and holds the score for that segment. That
 * score is determined by the actual scores of the segment (per category).
 */
export class SegmentScoreContainer extends ScoreContainer implements MediaSegment {
  /** ID of the object this SegmentScoreContainer belongsTo. */
  public readonly objectId: string;
  /** ID of the segment this SegmentScoreContainer belongsTo (objectId + segmentId = unique). */
  public readonly segmentId: string;
  /** Sequence number of the MediaSegment within the streams of segments (i.e. i-th segment in the video). */
  public readonly sequenceNumber: number;
  /** Start time of the MediaSegment in frames. */
  public readonly start: number;
  /** End time of the MediaSegment in frames. */
  public readonly end: number;
  /** Absolute start time of the MediaSegment in seconds. */
  public readonly startabs: number;
  /** Absolute end time of the MediaSegment in seconds. */
  public readonly endabs: number;

  /**
   * Default constructor.
   *
   * @param {MediaSegment} _mediaSegment Reference to the MediaSegment this container has been created for.
   * @param {MediaObjectScoreContainer} _objectScoreContainer Reference to the MediaObjectScoreContainer that contains this SegmentScoreContainer.
   */
  public constructor(private readonly _mediaSegment: MediaSegment, private readonly _objectScoreContainer: MediaObjectScoreContainer) {
    super();

    /* Make a logic check: objectId of MediaSegment must match that of the MediaObjectScoreContainer. */
    if (_mediaSegment.objectId !== _objectScoreContainer.objectId) {
      throw new Error('You cannot associate a MediaObjectScoreContainer with ID \'' + _objectScoreContainer.objectId + '\' with a segment with objectId \'' + _mediaSegment.objectId + '\'.');
    }

    /* Assign values from MediaSegment. */
    this.segmentId = _mediaSegment.segmentId;
    this.objectId = _mediaSegment.objectId;
    this.sequenceNumber = _mediaSegment.sequenceNumber;
    this.start = _mediaSegment.start;
    this.end = _mediaSegment.end;
    this.startabs = _mediaSegment.startabs;
    this.endabs = _mediaSegment.endabs;
  }

  /** List of scores. Maps per containerId the category and similarity score. */
  private _scores: Map<number, Map<WeightedFeatureCategory, number>> = new Map();

  /**
   * Returns the map of scores
   *
   */
  get scores(): Map<number, Map<WeightedFeatureCategory, number>> {
    return this._scores;
  }

  /** Map containing the metadata that belongs to the segment. Can be empty! */
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
   * Returns the score per category max pooled over the container (querycontainer)
   */
  get scoresPerCategory() {
    const map = new Map<WeightedFeatureCategory, number>();
    this._scores.forEach((categoryMap, containerId) => {
      categoryMap.forEach((score, category) => {
        if (map.has(category)) {
          if (map.get(category) < score) {
            map.set(category, score);
          }
        } else {
          map.set(category, score);
        }
      });
    });
    return map;
  }

  /**
   *
   * @return {MediaObjectScoreContainer}
   */
  get objectScoreContainer(): MediaObjectScoreContainer {
    return this._objectScoreContainer;
  }

  /**
   * Adds a similarity object to this SegmentScoreContainer by pushing the category and
   * the actual value to their respective arrays. The segmentId of the Similarity object
   * must be equal to the segmentId of the SegmentScoreContainer.
   */
  public addSimilarity(category: WeightedFeatureCategory, similarity: StringDoublePair, containerId: number): boolean {
    if (similarity.key !== this._mediaSegment.segmentId) {
      return false;
    }
    if (!this._scores.has(containerId)) {
      this._scores.set(containerId, new Map());
    }
    this._scores.get(containerId).set(category, similarity.value);
    return true;
  }

  /**
   * Updates the score value by multiplying the scores in the scores array by the weights
   * of the associated feature-object. Only results in the provided list are considered.
   *
   * @param features List of feature categories that should be used to calculate the score.
   * @param func The fusion function that should be used to calculate the score.
   */
  public update(features: WeightedFeatureCategory[], func: FusionFunction) {
    const score = func.scoreForSegment(features, this);
    this._score = score;
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
   * Serializes this SegmentScoreContainer into a plain JavaScript object.
   */
  public serialize(): MediaSegment {
    return <MediaSegment>{
      segmentId: this.segmentId,
      objectId: this.objectId,
      sequenceNumber: this.sequenceNumber,
      start: this.start,
      end: this.end,
      startabs: this.startabs,
      endabs: this.endabs
    }
  }

}
