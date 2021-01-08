import {Pipe, PipeTransform} from '@angular/core';
import {MediaSegmentScoreContainer} from '../../model/results/scores/segment-score-container.model';

@Pipe({
  name: 'OrderBySegmentIdPipe'
})
export class OrderBySegmentIdPipe implements PipeTransform {

  /**
   * Returns the provided array of SegmentScoreContainer sorted by their id.
   *
   */
  public transform(array: Array<MediaSegmentScoreContainer>, desc: boolean = true): Array<MediaSegmentScoreContainer> {
    if (!array || array.length === 0) {
      return [];
    }
    return array.sort((a: MediaSegmentScoreContainer, b: MediaSegmentScoreContainer) => {
        return a.segmentId.localeCompare(b.segmentId);
      }
    );
  }
}
