import {Pipe, PipeTransform} from '@angular/core';
import {MediaSegmentScoreContainer} from '../../model/results/scores/segment-score-container.model';
import {OrderByScorePipe} from './order-by-score.pipe';
import {OrderBySegmentPipe} from './order-by-segment.pipe';
import {OrderBySegmentIdPipe} from './order-by-segment-id.pipe';

export enum OrderType {
  /**
   * Type to use OrderByScorePipe (actually order the segments by their score)
   */
  SCORE,
  /**
   * Type to use OrderBySegmenPipe (actually orders the segments by their time values)
   */
  SEGMENT_TIME,
  /**
   * Type to use OrderBySegmentIdPipe (actually orders the segments by their id)
   */
  SEGMENT_ID
}

/**
 * A pipe which can take an argument to which sorting it should use
 */
@Pipe({name: 'orderBy'})
export class OrderByPipe implements PipeTransform {

  /**
   * Pipe for ordering along a specific type
   * @param array The array to order
   * @param type The type. Defaults to score pipe
   */
  transform(array: Array<MediaSegmentScoreContainer>, type: OrderType = OrderType.SCORE): Array<MediaSegmentScoreContainer> {
    let pipe;
    switch (type) {
      case OrderType.SCORE:
        pipe = new OrderByScorePipe();
        break;
      case OrderType.SEGMENT_TIME:
        pipe = new OrderBySegmentPipe()
        break;
      case OrderType.SEGMENT_ID:
        pipe = new OrderBySegmentIdPipe();
        break;
    }
    return pipe.transform(array);
  }
}
