import {MediaObjectScoreContainer} from '../../shared/model/results/scores/media-object-score-container.model';
import {ScoredPath} from './scored-path.model';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';

/**
 * A container of ScoredPath elements which belong to the same object.
 */
export class ScoredPathObjectContainer {

  /**
   * The best scored path, this is important, as these containers are to be sorted based on that best path
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
      /* the bestPath is the one with the highest score */
      this.bestPath = scoredPaths.sort((a, b) => b.score - a.score)[0];
    } else if (scoredPaths.length === 1) {
      this.bestPath = scoredPaths[0];
    } else {
      console.log(`ScoredPath empty for ${objectScoreContainer.objectId}`);
      this.bestPath = undefined;
    }
  }

  /**
   * Returns all segments of this object, ordered by their path score in descending order.
   */
  get segmentsInPathOrderedDesc(): SegmentScoreContainer[] {
    const segments = [];
    this.scoredPaths.sort((a, b) => b.score - a.score).forEach(scoredPath => {
      scoredPath.segments.forEach(segment => segments.push(segment));
    });
    return segments;
  }

  public toString() {
    return `${this.objectScoreContainer.objectId}::${this.bestPath}`
  }
}
