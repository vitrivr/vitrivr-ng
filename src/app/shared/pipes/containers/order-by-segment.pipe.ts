import {Pipe, PipeTransform} from '@angular/core';
import {MediaSegmentScoreContainer} from '../../model/results/scores/segment-score-container.model';

@Pipe({
  name: 'OrderBySegmentPipe'
})
export class OrderBySegmentPipe implements PipeTransform {

  /**
   * Returns the provided array of SegmentScoreContainers sorted by temporal sequence of the segments.
   *
   * @param {Array<MediaSegmentScoreContainer>} array
   * @param {boolean} desc
   * @return {Array<MediaSegmentScoreContainer>}
   */
  public transform(array: Array<MediaSegmentScoreContainer>, desc: boolean = true): Array<MediaSegmentScoreContainer> {
    if (!array || array.length === 0) {
      return [];
    }
    const results = array.sort((a: MediaSegmentScoreContainer, b: MediaSegmentScoreContainer) => {
      /**
       * This logic is ok even if a.startabs or b.startabs is 0. This is because sorting by sequence number still work.
       */
      if (desc) {
        if (!a.startabs || !b.startabs) {
          return a.sequenceNumber - b.sequenceNumber
        }
        return a.startabs - b.startabs;
      } else {
        if (!a.startabs || !b.startabs) {
          return b.sequenceNumber - a.sequenceNumber
        }
        return b.startabs - a.startabs;
      }
    });
    return results;
  }
}
