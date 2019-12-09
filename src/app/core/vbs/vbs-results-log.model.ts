import {SubmissionType, VbsSubmission} from "../../shared/model/vbs/interfaces/vbs-submission.model";
import {VbsResult} from "../../shared/model/vbs/interfaces/vbs-result.model";
import {SegmentScoreContainer} from "../../shared/model/results/scores/segment-score-container.model";

export class VbsResultsLog implements VbsSubmission {

  /** Timestam of the VbsInteractionLog. */
  public readonly timestamp: number = Date.now();

  /** Type of the VbsInteractionLog. */
  public readonly type: SubmissionType = 'result';

  /** List of results events. */
  public readonly results: VbsResult[] = [];

  /**
   * Constructor
   *
   * @param teamId
   * @param memberId
   */
  constructor(public readonly teamId: string, public readonly memberId: number) {}

  /**
   * Maps a list of {SegmentScoreContainer}s to a list of {VbsResults}.
   *
   * @param list The list of {SegmentScoreContainer}s to convert.
   * @param limit The number of entries to retain (defaults to 500)
   * @return List of {VbsResults}
   */
  public static mapSegmentScoreContainer(list: SegmentScoreContainer[], limit = 500): VbsResult[] {
    return list.map((v,i) => <VbsResult>{video: v.objectId, shot: v.sequenceNumber, score: v.score, rank: i})
  }
}
