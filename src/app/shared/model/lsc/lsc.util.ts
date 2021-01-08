import {LscResult} from './interfaces/lsc-result.model';
import {VbsResultsLog} from '../../../core/vbs/vbs-results-log.model';
import {LscSubmission} from './interfaces/lsc-submission.model';
import {MediaSegmentScoreContainer} from '../results/scores/segment-score-container.model';
import {InteractionEvent} from '../events/interaction-event.model';
import {InteractionEventType} from '../events/interaction-event-type.model';

export class LscUtil {


  static mapSegmentScoreContainer(team: string, memberId: number, context: string, list: MediaSegmentScoreContainer[], event: InteractionEvent): LscSubmission {
    const _categories: string[] = [];
    const _types: string[] = [];
    const _results: LscResult[] = [];
    const _values: string[] = [];
    const _sortType: string[] = [];
    _sortType.push(context);
    event.components.forEach(component => {
      if (component.type === InteractionEventType.NEW_QUERY_CONTAINER) {
        _values.push('NEW_QUERY_CONTAINER')
        return;
      }
      if (component.type === InteractionEventType.NEW_QUERY_STAGE) {
        _values.push('NEW_QUERY_STAGE')
        return;
      }
      (component.context.get('q:categories') as string[]).forEach(c => {
        const category = VbsResultsLog.featureCategoryToVbsCategory(c);
        const type = VbsResultsLog.featureCategoryToVbsType(c);
        if (category != null && _categories.indexOf(category) === -1) {
          _categories.push(category)
        }
        if (type != null && _types.indexOf(type) === -1) {
          _types.push(type)
        }
      })
      _values.push(component.context.get('q:categories'))
      _values.push(component.context.get('q:value'))
    });
    list.forEach((segmentScoreContainer, index) => {
      _results.push(<LscResult>{
        video: segmentScoreContainer.segmentId.replace('is_', ''),
        frame: segmentScoreContainer.sequenceNumber,
        score: segmentScoreContainer.score,
        rank: index
      })
      segmentScoreContainer.scores.forEach((categoryScoreMap, containerId) => {
        categoryScoreMap.forEach((score, feature) => {
          const category = VbsResultsLog.featureCategoryToVbsCategory(feature.name);
          const type = VbsResultsLog.featureCategoryToVbsType(feature.name);
          if (category != null && _categories.indexOf(category) === -1) {
            _categories.push(category)
          }
          if (type != null && _types.indexOf(type) === -1) {
            _types.push(type)
          }
        });
      })
    });
    const timestamp: number = Date.now();

    return <LscSubmission>{
      memberId: memberId,
      timestamp: timestamp,
      results: _results,
      resultSetAvailability: 'top',
      usedCategories: _categories,
      usedTypes: _types,
      values: _values,
      sortType: _sortType
    }
  }
}
