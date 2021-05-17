import {FusionFunction} from './weight-function.interface';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {MediaObjectScoreContainer} from '../scores/media-object-score-container.model';
import {MediaSegmentScoreContainer} from '../scores/segment-score-container.model';
import {MaxpoolFusionFunction} from './maxpool-fusion-function.model';
import {ScoredPath} from '../../../../results/temporal/scored-path.model';
import {Path} from '../../../../results/temporal/path.model';
import {TemporalDistance} from '../../../../query/temporal-distance/temporal-distance.model';

type SegmentId = string;
type ObjectId = string;
type ContainerId = number;
type Score = number;
type SegmentContainerIdentifierKey = string;
type PathIdentifierKey = string;

export class TemporalFusionFunction implements FusionFunction {

  /** The current number of query containers */
  static queryContainerCount: number;
  private static readonly DEFAULT_TEMPORAL_DISTANCE = new TemporalDistance(30, 'LESS'); // 30s
  private static _instance: TemporalFusionFunction = new TemporalFusionFunction();
  /** The underlying FusionFunction to use for segments */
  private _segmentFusionFunction: FusionFunction = new MaxpoolFusionFunction();

  /** Stores per segment the path it belongs to.  A segment may "help" multiple paths, but will always know its best path */
  private _bestPathPerCombination: Map<SegmentContainerIdentifierKey, SegmentContainerIdentifier> = new Map();

  /** Stores the best set of paths, mapping start-segment to the list of segments.*/
  private _paths: Map<SegmentContainerIdentifierKey, ScoredPath> = new Map();

  private _verbose = false;

  /** The temporal distance in secods **/
  private _temporalDistance = TemporalFusionFunction.DEFAULT_TEMPORAL_DISTANCE;

  public static instance(): TemporalFusionFunction {
    return TemporalFusionFunction._instance;
  }

  private constructor() {
  }

  /**
   * Maxpools over all possible paths inside this object
   */
  scoreForObject(features: WeightedFeatureCategory[], mediaObjectScoreContainer: MediaObjectScoreContainer): Score {
    const paths = this.computePaths(features, mediaObjectScoreContainer);
    let max = 0;
    paths.forEach((path, pathIdentifier) => max = Math.max(max, path.score));
    return max;
  }

  /**
   * Computes all optimal paths inside an score container
   * There is a bonus for temporal scoring here.
   * This methods seeks to determine an optimal path through multiple segments. This path should fulfill the following conditions:
   * - Each element of the path should have a higher containerId than its predecessor
   * - Each element of the path is temporally close to its predecessor
   * A path can skip segments, if the successor is temporally close enough
   * A path can skip containers since we assume cineast might have not found a result for container 2, but it did find temporally close segments for container 1 and three
   * The score of the element is then determined by the score of this optimal path of segments
   */
  public computePaths(features: WeightedFeatureCategory[], objectContainer: MediaObjectScoreContainer): Map<PathIdentifierKey, ScoredPath> {
    const segmentsTemporallyOrdered = Array.from(objectContainer.segments).sort((a, b) => a.startabs - b.startabs);
    segmentsTemporallyOrdered.forEach(seg => this.verbose(`[TemporalFusionFunction.scoreForObject] iterating over segment ${seg.segmentId}`));

    /* for each segment, assume it could be the start of the optimal sequence path for this object */
    segmentsTemporallyOrdered.forEach((segment, index) => {
      this.verbose(`[TS_scoreForObject]: Seeking for segment ${segment.segmentId} with ${segment.scores.size} score elements`);
      // for each container, assume start of sequence
      segment.scores.forEach((categoryMap, containerId) => {
        /* Create initial suggestion, a single element */
        const suggestion = new Path(new Map());
        suggestion.pathMap.set(containerId, segment);
        /* Go look for the best temporal path */
        const recursiveSuggestion = this.temporalPath(segment, segmentsTemporallyOrdered.slice(index + 1, segmentsTemporallyOrdered.length), containerId, suggestion, features);
        /* Score the path */
        const recursiveSuggestionScore = this.temporalScore(features, recursiveSuggestion);
        /* For each element in the path, go update the cache */
        recursiveSuggestion.pathMap.forEach((pathSegment, _pathSegmentContainerId) => {
          this.updateCache(pathSegment, _pathSegmentContainerId, recursiveSuggestion, recursiveSuggestionScore);
        });
      });
    });
    const paths = new Map<PathIdentifierKey, ScoredPath>();
    /* For each segment, add its best path to the resulting set of paths */
    segmentsTemporallyOrdered.forEach(segment => {
      segment.scores.forEach((categoryMap, containerId) => {
        /* Create identifier for this <segment, container> combo */
        const identifier = new SegmentContainerIdentifier(segment.segmentId, containerId);
        /* If there is a best path for this combo, store it in the list of paths */
        if (this._bestPathPerCombination.has(identifier.key())) {
          /* get path */
          const path: ScoredPath = this._paths.get(this._bestPathPerCombination.get(identifier.key()).key());
          /* Store it in our list of paths. Two identical paths have the same score, so we do not worry about overwriting values here */
          paths.set(path.path.key(), path);
        } else {
          /* This should not happen, every combo should have a best path*/
          console.warn(`[TS.computePaths] no path exists for ${identifier}`);
          console.log(this._bestPathPerCombination);
          console.log(this._bestPathPerCombination.get(identifier.key()));
        }
      })
    });
    return paths;
  }

  scoreForSegment(features: WeightedFeatureCategory[], segmentScoreContainer: MediaSegmentScoreContainer): Score {
    let max = -1;
    segmentScoreContainer.scores.forEach((value, containerId) => {
      const identifier = new SegmentContainerIdentifier(segmentScoreContainer.segmentId, containerId);
      if (this._bestPathPerCombination.has(identifier.key())) {
        max = Math.max(this._paths.get(this._bestPathPerCombination.get(identifier.key()).key()).score, max);
      }
    });
    return max;
  }

  public individualScoreForSegment(features: WeightedFeatureCategory[], segmentScoreContainer: MediaSegmentScoreContainer): Score {
    let score = this._segmentFusionFunction.scoreForSegment(features, segmentScoreContainer);
    if (segmentScoreContainer.scores.size === 0) {
      this.verbose(`[TemporalFusion.individualScoreForSegment] Segment ${segmentScoreContainer.segmentId} has no score elements yet, initializing to -1`);
      score = -1;
    }
    this.verbose(`[TemporalFusion.individualScoreForSegment] Segment=${segmentScoreContainer.segmentId} score=${score}`);
    return score;
  }

  /**
   * Completely reset state of this container
   */
  reset() {
    console.debug('resetting temporal fusion function');
    this._bestPathPerCombination.clear();
    this._paths.clear();
  }

  name(): string {
    return 'temporal';
  }

  /**
   * Sets the temporal distance, defaults to 30s.
   *
   * @param amount Temporal distance in seconds
   */
  public setTemporalDistance(amount: TemporalDistance) {
    const prev = this._temporalDistance;
    this._temporalDistance = amount;
    console.log(`[TS.setTempDist] Updating temp dist (prev=${prev}) to ${this._temporalDistance}`);
  }

  /**
   * Check whether a segment is a logical successor to another (e.g. temporally close and increasing container ids)
   */
  // tslint:disable-next-line:member-ordering
  private isLogicalSuccessor(predecessor: MediaSegmentScoreContainer, predecessorContainerId: ContainerId, successor: MediaSegmentScoreContainer, containerId: ContainerId): boolean {
    return this._temporalDistance.matchesTemporally(successor.startabs - predecessor.endabs) && predecessorContainerId < containerId;
  }

  private updateCache(segment: MediaSegmentScoreContainer, containerId: ContainerId, path: Path, score: Score) {
    const identifier = new SegmentContainerIdentifier(segment.segmentId, containerId);
    const start: SegmentContainerIdentifier = this.start(path);
    /* First, update the best path per container / segment combo cache */
    if (this._bestPathPerCombination.has(identifier.key())) {
      const pathIdentifier = this._bestPathPerCombination.get(identifier.key());
      /* If the path currently stored for this combo has a lower score than the new one, set a new best path for this combo */
      if (this._paths.get(pathIdentifier.key()).score < score) {
        this.verbose(`[TS.updateCache] Updating best path cache for ${identifier} to ${start}`);
        this._bestPathPerCombination.set(identifier.key(), start);
      }
      /* Otherwise, ignore this call*/
    } else {
      this.verbose(`[TS.updateCache] Initializing best path cache for ${identifier} to ${start}`);
      this._bestPathPerCombination.set(identifier.key(), start);
    }

    /* Next, update the best path-start cache */
    if (this._paths.has(start.key())) {
      if (this._paths.get(start.key()).score < score) {
        const newBestPath = new ScoredPath(path, score);
        this.verbose(`[TS.updateCache] Updating path start because of ${identifier} for ${start} to ${newBestPath}`);
        this._paths.set(start.key(), newBestPath);
      }
    } else {
      const newBestPath = new ScoredPath(path, score);
      this.verbose(`[TS.updateCache] Initializing path start because of ${identifier} for ${start} to ${newBestPath}`);
      this._paths.set(start.key(), newBestPath);
    }
  }

  private start(path: Path): SegmentContainerIdentifier {
    let low: ContainerId = Number.MAX_VALUE;
    let seg: SegmentId = null;
    path.pathMap.forEach((value, key) => {
      if (key < low) {
        low = key;
        seg = value.segmentId;
      }
    });
    return new SegmentContainerIdentifier(seg, low);
  }

  private temporalScore(features: WeightedFeatureCategory[], temporalPath: Path): number {
    let score = 0;
    // very naive approach: sum and normalize over no. of containers
    temporalPath.pathMap.forEach((segment, _containerId) => {
      score += this.individualScoreForSegment(features, segment);
      this.verbose(`[TemporalFusionFunction.temporalScore] Incremented score to ${score} for segment ${segment.segmentId}`)
    });
    this.verbose(`[TemporalFusionFunction.temporalScore] for length ${temporalPath.pathMap.size}, score=${score} is normalized=${score / TemporalFusionFunction.queryContainerCount}`);
    return score / TemporalFusionFunction.queryContainerCount;
  }

  /**
   * TODO
   *
   * @param seeker segment looking for further segments to join its group
   * @param segments Temporally ordered segments starting from, but not including seeker. lower timestamps first.
   * @param seekerContainerId containerId for seeker
   * @param pathToAndWithSeeker path up to and including this seeker
   * @param features for scoring
   *
   * @return the best path continuing from this seeker segment. If there is no better path, just returns the path to the seeker segment
   */
  private temporalPath(seeker: MediaSegmentScoreContainer,
                       segments: MediaSegmentScoreContainer[],
                       seekerContainerId: number,
                       pathToAndWithSeeker: Path,
                       features: WeightedFeatureCategory[]): Path {
    /* the initial best score is simply quitting at this segment */
    let bestScore = this.temporalScore(features, pathToAndWithSeeker);
    /* store best path, assumption is simply path to this segment */
    let bestPath = new Path(new Map(pathToAndWithSeeker.pathMap));
    /* check if containerId of seeker is the maximum id, therefore there is no successor to the seeker / container combination */
    if (seekerContainerId === TemporalFusionFunction.queryContainerCount - 1) {
      return pathToAndWithSeeker;
    }
    /* Iterate over all remaining segment / container combinations to see if there is a path with further segments which improves the score */
    segments.forEach((candidateSegment, candidateSegmentIdx) => {
      /* iterate over all possible containers in this candidateSegment */
      candidateSegment.scores.forEach((categoryMap, candidateContainerId) => {
        /* if candidateSegment is not temporally close enough or candidateContainerId is lower, exit */
        if (!this.isLogicalSuccessor(seeker, seekerContainerId, candidateSegment, candidateContainerId)) {
          /* candidateSegment - candidateContainerId combo is not a candidateSegment for further search */
          return;
        }
        /* generate potential path with candidate segment */
        const candidatePath = new Path(new Map(pathToAndWithSeeker.pathMap));
        candidatePath.pathMap.set(candidateContainerId, candidateSegment);
        /* check if the score with the candidate is better than the existing best path*/
        const candidateScore = this.temporalScore(features, candidatePath);
        if (candidateScore >= bestScore) {
          bestScore = candidateScore;
          bestPath = candidatePath
        }
        /* if this candidateSegment is last in the list, there is no potential to go further down the path */
        if (candidateSegmentIdx === segments.length - 1) {
          return;
        }
        /* Additionally, try to go down the rabbit hole, and look for a better path */
        const recursivelyFoundPath = this.temporalPath(candidateSegment, segments.slice(candidateSegmentIdx + 1, segments.length), candidateContainerId, candidatePath, features);
        /* check if that path is better than the one we are currently considering */
        const recursivelyFoundScore = this.temporalScore(features, recursivelyFoundPath);
        if (recursivelyFoundScore >= bestScore) {
          bestScore = recursivelyFoundScore;
          bestPath = recursivelyFoundPath;
        }
      });
    });

    return bestPath;
  }

  /**
   * A hacky way to not bother with more sophisticated logging than console.XYZ
   * Shall be replaced with proper logging
   * @param msg The message to log (Will be logged by issuing console.debug
   */
  private verbose(msg: string) {
    if (this._verbose) {
      console.debug(msg);
    }
  }
}

class SegmentContainerIdentifier {
  constructor(readonly segmentId: SegmentId, readonly containerId: ContainerId) {
  }


  public key(): SegmentContainerIdentifierKey {
    return this.toString();
  }

  public toString(): string {
    return this.segmentId + ':' + this.containerId
  }
}
