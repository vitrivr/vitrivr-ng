import {MediaObjectScoreContainer} from '../../shared/model/results/scores/media-object-score-container.model';
import {ScoredPath} from './scored-path.model';

/**
 * A container of ScoredPath elements which belong to the same object.
 */
export class ScoredPathObjectContainer {

  /**
   * The best scored path
   */
  public readonly bestPath;

  /**
   * Creates a new container
   * @param objectScoreContainer the MediaObjectScoreContainer to which all these paths belong to
   * @param scoredPaths All the ScoredPath elements for the object
   */
  constructor(public readonly objectScoreContainer: MediaObjectScoreContainer,
              public readonly scoredPaths: ScoredPath[]) {
    if (scoredPaths.length > 1) {

      this.bestPath = scoredPaths.sort((a, b) => b.score - a.score)[0];
    } else if (scoredPaths.length === 1) {
      this.bestPath = scoredPaths[0];
    } else {
      this.bestPath = undefined;
    }
  }

  public toString() {
    return `${this.objectScoreContainer.objectId}::${this.bestPath}`
  }
}
