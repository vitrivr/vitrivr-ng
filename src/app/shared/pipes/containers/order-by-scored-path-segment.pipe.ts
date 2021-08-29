import {Pipe, PipeTransform} from '@angular/core';
import {MediaSegmentScoreContainer} from '../../model/results/scores/segment-score-container.model';
import {ScoredPathSegment} from '../../../results/temporal/scored-path-segment.model';

@Pipe({
  name: 'OrderByScoredPathSegmentPipe'
})
export class OrderByScoredPathSegmentPipe implements PipeTransform {

  /**
   * Returns the provided array of ScoredPathSegment sorted by temporal sequence of the segments.
   *
   * @param {Array<ScoredPathSegment>} array
   * @param {boolean} desc
   * @return {Array<ScoredPathSegment>}
   */
  public transform(array: Array<ScoredPathSegment>, desc: boolean = true): Array<ScoredPathSegment> {
    if (!array || array.length === 0) {
      return [];
    }
    const results = array.sort((a: ScoredPathSegment, b: ScoredPathSegment) => {
      /**
       * This logic is ok even if a.startabs or b.startabs is 0. This is because sorting by sequence number still work.
       */
      if (desc) {
        if (!a.segment.startabs || !b.segment.startabs) {
          return a.segment.sequenceNumber - b.segment.sequenceNumber
        }
        return a.segment.startabs - b.segment.startabs;
      } else {
        if (!a.segment.startabs || !b.segment.startabs) {
          return b.segment.sequenceNumber - a.segment.sequenceNumber
        }
        return b.segment.startabs - a.segment.startabs;
      }
    });
    return results;
  }
}
