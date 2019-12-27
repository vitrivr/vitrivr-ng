import {FusionFunction} from './weight-function.interface';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {MediaObjectScoreContainer} from '../scores/media-object-score-container.model';
import {SegmentScoreContainer} from '../scores/segment-score-container.model';
import {DefaultFusionFunction} from './default-fusion-function.model';

type SegmentId = string;
type ObjectId = string;
type ContainerId = number;
type Score = number;
type Path = Map<ContainerId, SegmentScoreContainer>

export class TemporalFusionFunction implements FusionFunction {

    private static readonly TEMPORAL_DISTANCE_CAP = 30; // 30s

    private static _instance: TemporalFusionFunction = new TemporalFusionFunction();

    /** The current number of query containers */
    static queryContainerCount: number;

    /** The underlying FusionFunction to use for segments */
    private _segmentFusionFunction: FusionFunction = new DefaultFusionFunction();

    /** Stores per segment the path it belongs to.  A segment may "help" multiple paths, but will always know its best path */
    private _bestPathPerCombination: Map<SegmentContainerIdentifier, SegmentContainerIdentifier> = new Map();

    /** Stores the best set of paths, mapping start-segment to the list of segments.*/
    private _paths: Map<SegmentContainerIdentifier, [Path, Score]> = new Map();

    private _verbose = false;

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
        paths.forEach((value, key) => max = Math.max(max, value));
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
    public computePaths(features: WeightedFeatureCategory[], objectContainer: MediaObjectScoreContainer): Map<Path, Score> {
        const segmentsTemporallyOrdered = Array.from(objectContainer.segments).sort((a, b) => a.startabs - b.startabs);
        segmentsTemporallyOrdered.forEach(seg => this.verbose(`[TemporalFusionFunction.scoreForObject] iterating over segment ${seg.segmentId}`));

        /* for each segment, assume it could be the start of the optimal sequence path for this object */
        segmentsTemporallyOrdered.forEach((segment, index) => {
            this.verbose(`[TS_scoreForObject]: Seeking for segment ${segment.segmentId} with ${segment.scores.size} score elements`);
            // for each container, assume start of sequence
            segment.scores.forEach((categoryMap, containerId) => {
                /* Create initial suggestion, a single element */
                const suggestion = new Map();
                suggestion.set(containerId, segment);
                /* Go look for the best temporal path */
                const recursiveSuggestion = this.temporalPath(segment, segmentsTemporallyOrdered.slice(index + 1, segmentsTemporallyOrdered.length), containerId, suggestion, features);
                /* Score the path */
                const recursiveSuggestionScore = this.temporalScore(features, recursiveSuggestion);
                /* For each element in the path, go update the cache */
                recursiveSuggestion.forEach((pathSegment, _pathSegmentContainerId) => {
                    this.updateCache(pathSegment, _pathSegmentContainerId, recursiveSuggestion, recursiveSuggestionScore);
                });
            });
        });
        const paths = new Map<Path, Score>();
        /* For each segment, add its best path to the resulting set of paths */
        segmentsTemporallyOrdered.forEach(segment => {
            segment.scores.forEach((categoryMap, containerId) => {
                const identifier = new SegmentContainerIdentifier(segment.segmentId, containerId);
                if (this._bestPathPerCombination.has(identifier)) {
                    const path = this._paths.get(this._bestPathPerCombination.get(identifier));
                    paths.set(path[0], path[1]);
                } else {
                    console.warn(`[TS.computePaths] no path exists for ${identifier}`)
                    console.log(this._bestPathPerCombination)
                    console.log(this._bestPathPerCombination.get(identifier))
                }
            })
        });
        return paths;
    }

    private updateCache(segment: SegmentScoreContainer, containerId: ContainerId, path: Path, score: Score) {
        const identifier = new SegmentContainerIdentifier(segment.segmentId, containerId);
        const start = this.start(path);
        /* First, update the best path per container / segment combo cache */
        if (this._bestPathPerCombination.has(identifier)) {
            const pathIdentifier = this._bestPathPerCombination.get(identifier);
            const prevScore = this._paths.get(pathIdentifier)[1];
            if (prevScore < score) {
                console.log(`[TS.updateCache] Updating best path cache for ${identifier} to ${JSON.stringify(start)}`);
                this._bestPathPerCombination.set(identifier, start);
            }
        } else {
            console.log(`[TS.updateCache] Initializing best path cache for ${identifier} to ${JSON.stringify(start)}`);
            this._bestPathPerCombination.set(identifier, start);
        }

        /* Next, update the best path-start cache */
        if (this._paths.has(start)) {
            const prevScore = this._paths.get(start)[1];
            if (prevScore < score) {
                console.log(`[TS.updateCache] Updating path start because of ${identifier} for ${JSON.stringify(start)} to ${JSON.stringify([Array.from(path).map(value => [value[0], [value[1].segmentId]]), score])}`);
                this._paths.set(start, [path, score]);
            }
        } else {
            console.log(`[TS.updateCache] Initializing path start because of ${identifier} for ${JSON.stringify(start)} to ${JSON.stringify([Array.from(path).map(value => [value[0], [value[1].segmentId]]), score])}`);
            this._paths.set(start, [path, score]);
        }
    }

    private start(path: Path): SegmentContainerIdentifier {
        let low: ContainerId = Number.MAX_VALUE;
        let seg: SegmentId = null;
        path.forEach((value, key) => {
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
        temporalPath.forEach((segment, _containerId) => {
            score += this.individualScoreForSegment(features, segment);
            this.verbose(`[TemporalFusionFunction.temporalScore] Incremented score to ${score} for segment ${segment.segmentId}`)
        });
        this.verbose(`[TemporalFusionFunction.temporalScore] for length ${temporalPath.size}, score=${score} is normalized=${score / TemporalFusionFunction.queryContainerCount}`);
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
    private temporalPath(seeker: SegmentScoreContainer,
                         segments: SegmentScoreContainer[],
                         seekerContainerId: number,
                         pathToAndWithSeeker: Path,
                         features: WeightedFeatureCategory[]): Path {
        /* the initial best score is simply quitting at this segment */
        let bestScore = this.temporalScore(features, pathToAndWithSeeker);
        /* store best path, assumption is simply path to this segment */
        let bestPath = new Map(pathToAndWithSeeker);
        /* check if containerId of seeker is the maximum id, therefore there is no successor to the seeker / container combination */
        if (seekerContainerId === TemporalFusionFunction.queryContainerCount - 1) {
            return pathToAndWithSeeker;
        }
        /* Iterate over all remaining segment / container combinations to see if there is a path with further segments which improves the score */
        segments.forEach((candidateSegment, candidateSegmentIdx) => {
            /* iterate over all possible containers in this candidateSegment */
            candidateSegment.scores.forEach((categoryMap, candidateContainerId) => {
                /* if candidateSegment is not temporally close enough or candidateContainerId is lower, exit */
                if (!TemporalFusionFunction.isLogicalSuccessor(seeker, seekerContainerId, candidateSegment, candidateContainerId)) {
                    /* candidateSegment - candidateContainerId combo is not a candidateSegment for further search */
                    return;
                }
                /* generate potential path with candidate segment */
                const candidatePath = new Map(pathToAndWithSeeker);
                candidatePath.set(candidateContainerId, candidateSegment);
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
     * Check whether a segment is a logical successor to another (e.g. temporally close and increasing container ids)
     */
    // tslint:disable-next-line:member-ordering
    private static isLogicalSuccessor(predecessor: SegmentScoreContainer, predecessorContainerId: ContainerId, successor: SegmentScoreContainer, containerId: ContainerId): boolean {
        return successor.startabs - predecessor.endabs <= TemporalFusionFunction.TEMPORAL_DISTANCE_CAP && predecessorContainerId < containerId;
    }

    scoreForSegment(features: WeightedFeatureCategory[], segmentScoreContainer: SegmentScoreContainer): Score {
        let max = -1;
        segmentScoreContainer.scores.forEach((value, containerId) => {
            const identifier = new SegmentContainerIdentifier(segmentScoreContainer.segmentId, containerId);
            if (this._bestPathPerCombination.has(identifier)) {
                max = Math.max(this._paths.get(this._bestPathPerCombination.get(identifier))[1], max);
            }
        });
        return max;
    }

    public individualScoreForSegment(features: WeightedFeatureCategory[], segmentScoreContainer: SegmentScoreContainer): Score {
        let score = this._segmentFusionFunction.scoreForSegment(features, segmentScoreContainer);
        if (segmentScoreContainer.scores.size === 0) {
            this.verbose(`[TemporalFusion.individualScoreForSegment] Segment ${segmentScoreContainer.segmentId} has no score elements yet, initializing to -1`);
            score = -1;
        }
        this.verbose(`[TemporalFusion.individualScoreForSegment] Segment=${segmentScoreContainer.segmentId} score=${score}`);
        return score;
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

    public toString(): string {
        return this.segmentId + ':' + this.containerId
    }

    public equals(obj: SegmentContainerIdentifier): boolean {
        return this.toString() === obj.toString()
    }

    hashCode(): number {
        return this.toString().
    }
}
