import {FusionFunction} from '../fusion/weight-function.interface';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {StringDoublePair} from '../../../../../../openapi/cineast';

/**
 * This class defines an abstract container for compound scores, i.e. scores that are obtained as a result of multiple
 * sub-scores. It defines some basic methods that can be invoked for such a ScoreContainer.
 *
 * Note: The class is used to build a ScoreContainer hierarchy for research-results returned by Cineast. For every MediaObject
 * (e.g. a video) a MediaObjectScoreContainer is created. That container in turn hosts a list of SegmentScoreContainer's,
 * which again host a set of Similarity objects (raw scores).
 *
 * Both containers are able to derive a score for themselves based on the sub-entities they host. These scores are used
 * to rank the research-results in the UI.
 */
export abstract class ScoreContainer {

  /** Score value. How it is obtained is up to the implementing class. */
  protected _score = 0;

  /**
   * Static comparator method. Compares two ScoreContainers so that they
   * are sorted in a descending order according to their score.
   *
   * Can be used with Array.prototype.sort();
   */
  public static compareDesc(a: ScoreContainer, b: ScoreContainer) {
    return b._score - a._score;
  }

  /**
   * Static comparator method. Compares two ScoreContainers so that they
   * are sorted in a ascending order according to their score.
   *
   * Can be used with Array.prototype.sort();
   */
  public static compareAsc(a: ScoreContainer, b: ScoreContainer) {
    return a._score - b._score;
  }

  /**
   * Getter for the container's score.
   */
  get score(): number {
    return this._score;
  }

  /**
   * Getter for the container's score as percent value.
   */
  get scorePercentage(): number {
    return Math.round(this._score * 1000) / 10
  }

  /**
   * Adds a Similarity object to the ScoreContainer. Usually, that object is somehow used to influence,
   * change the score of the Container.
   *
   * @param category Category for which to add the similarity value.
   * @param similarity Similarity value
   * @param containerId The containerId this similarity corresponds to
   */
  public abstract addSimilarity(category: WeightedFeatureCategory, similarity: StringDoublePair, containerId: number): void;

  /**
   * Method can be used to update the score of a ScoreContainer given a list of
   * feature categories and a weightPercentage function.
   *
   * @param features List of results that should be used to calculate the score.
   * @param func The weightPercentage function that should be used to calculate the score.
   * @param containerId The containerId this similarity corresponds to
   */
  public abstract update(features: WeightedFeatureCategory[], func: FusionFunction, containerId: number): void;
}
