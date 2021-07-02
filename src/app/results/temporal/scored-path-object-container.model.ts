import {MediaObjectScoreContainer} from '../../shared/model/results/scores/media-object-score-container.model';
import {ScoredPath} from './scored-path.model';
import {ScoredPathSegment} from './scored-path-segment.model';
import {ScoreContainer} from '../../shared/model/results/scores/compound-score-container.model';
import {WeightedFeatureCategory} from '../../shared/model/results/weighted-feature-category.model';
import {FusionFunction} from '../../shared/model/results/fusion/weight-function.interface';
import {StringDoublePair} from '../../../../openapi/cineast';

/**
 * A container of ScoredPath elements which belong to the same object.
 */
export class ScoredPathObjectContainer extends ScoreContainer {

  private tuples = new Array<ScoredPathSegment>();

  /**
   * Creates a new container
   * @param objectScoreContainer the MediaObjectScoreContainer to which all these paths belong to
   * @param scoredPaths All the ScoredPath elements for the object
   * @param _score The score of this path
   */
  constructor(public readonly objectScoreContainer: MediaObjectScoreContainer,
              public readonly scoredPaths: ScoredPath[],
              readonly _score) {
    super();
    scoredPaths.forEach(scoredPath => {
      scoredPath.segments.forEach(segment => this.tuples.push(new ScoredPathSegment(segment, scoredPath.score)));
    });
  }

  public getFlattenPaths(): Array<ScoredPathSegment> {
    return this.tuples;
  }

  public getSize(): number {
    return this.tuples.length;
  }

  addSimilarity(category: WeightedFeatureCategory, similarity: StringDoublePair, containerId: number): void {
  }

  update(features: WeightedFeatureCategory[], func: FusionFunction, containerId: number): void {
  }
}
