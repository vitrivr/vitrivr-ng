import {SubmissionType, VbsSubmission} from '../../shared/model/vbs/interfaces/vbs-submission.model';
import {VbsResult} from '../../shared/model/vbs/interfaces/vbs-result.model';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';

export class VbsResultsLog implements VbsSubmission {
  /** Timestam of the VbsInteractionLog. */
  public readonly timestamp: number = Date.now();
  /** Type of the VbsInteractionLog. */
  public readonly type: SubmissionType = 'result';
  /** List of {VbsResults} that make up this {VbsResultsLog}. */
  public readonly results: VbsResult[] = [];
  /** List of categories that were used  to create this {VbsResultsLog}. */
  public readonly usedCategories: string[] = [];
  /** List of types that were used  to create this {VbsResultsLog}. */
  public readonly usedTypes: string[] = [];
  /** Constant, since vitrivr NG always returns the top K results. */
  public readonly resultSetAvailability: string = 'top';

  /**
   * Maps a list of {SegmentScoreContainer}s to a {VbsResultsLog}.
   *
   * @param teamId The ID of the VBS team.
   * @param memberId The ID of the VBS team member.
   * @param list The list of {SegmentScoreContainer}s to convert.
   * @param limit The number of entries to retain (defaults to 500)
   * @return List of {VbsResultsLog}
   */
  public static mapSegmentScoreContainer(teamId: string, memberId: number, list: SegmentScoreContainer[], limit = 500): VbsResultsLog {
    const results = new VbsResultsLog(teamId, memberId);
    list.splice(limit);
    list.forEach((segmentScoreContainer,index) => {
      results.results.push(<VbsResult>{video: segmentScoreContainer.objectId, shot: segmentScoreContainer.sequenceNumber, score: segmentScoreContainer.score, rank: index});
      segmentScoreContainer.scores.forEach((categoryScoreMap, containerId) => {
        categoryScoreMap.forEach((score, feature) => {
        const category = this.featureCategoryToVbsCategory(feature.name);
        const type = this.featureCategoryToVbsType(feature.name);
        if (category != null && results.usedCategories.indexOf(category) === -1) {
          results.usedCategories.push(category)
        }
        if (type != null && results.usedTypes.indexOf(type) === -1) {
          results.usedTypes.push(type)
        }
        });
      })
    });

    return results
  }

  /**
   * Maps vitrivr feature categories to the VBS category.
   *
   * @param category
   */
  private static featureCategoryToVbsCategory(category: string): string {
    switch (category) {
      case 'ocr':
      case 'asr':
      case 'meta':
      case 'tagsft':
      case 'scenecaption':
      case 'boolean':
        return 'TEXT';
      case 'semantic':
      case 'motion':
      case 'edge':
      case 'globalcolor':
      case 'localcolor':
        return 'SKETCH';
      case 'localfeatures':
      case 'localfeatures_fast':
        return 'IMAGE';
      default:
        return null;
    }
  }

  /**
   * Maps vitrivr feature categories to the VBS type.
   *
   * @param category
   */
  private static featureCategoryToVbsType(category: string): string {
    switch (category) {
      case 'ocr':
        return 'OCR';
      case 'asr':
        return 'ASR';
      case 'meta':
        return 'metadata';
      case 'tagsft':
        return 'concept';
      case 'scenecaption':
        return 'caption';
      case 'boolean':
        return 'metadata';
      case 'semantic':
        return 'semanticSegmentation';
      case 'motion':
        return 'motion';
      case 'edge':
        return 'edge';
      case 'globalcolor':
      case 'localcolor':
        return 'color';
      case 'localfeatures':
      case 'localfeatures_fast':
        return 'localFeatures';
      default:
        return null;
    }
  }

  constructor(public readonly teamId: string, public readonly memberId: number) {
  }
}
