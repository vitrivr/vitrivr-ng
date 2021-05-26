import {MediaObjectScoreContainer} from '../../shared/model/results/scores/media-object-score-container.model';
import {ScoredPath} from './scored-path.model';
import {ScoredPathSegment} from './scored-path-segment.model';

/**
 * A container of ScoredPath elements which belong to the same object.
 */
export class ScoredPathObjectContainer {

  private tuples = new Array<ScoredPathSegment>();

  /**
   * Creates a new container
   * @param objectScoreContainer the MediaObjectScoreContainer to which all these paths belong to
   * @param scoredPaths All the ScoredPath elements for the object
   * @param bestPath The best scored path, this is important, as these containers are to be sorted based on that best path
   */
  constructor(public readonly objectScoreContainer: MediaObjectScoreContainer,
              public readonly scoredPaths: ScoredPath[],
              public readonly bestPath) {
    scoredPaths.forEach(scoredPath => {
      scoredPath.segments.forEach(segment => this.tuples.push(new ScoredPathSegment(segment, scoredPath.score)));
    });
  }

  public getFlattenPaths(): Array<ScoredPathSegment> {
    return this.tuples;
  }

  public toString() {
    return `${this.objectScoreContainer.objectId}::${this.bestPath}`
  }
}
