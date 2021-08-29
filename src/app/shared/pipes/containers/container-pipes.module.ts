import {NgModule} from '@angular/core';
import {OrderBySegmentPipe} from './order-by-segment.pipe';
import {OrderByScorePipe} from './order-by-score.pipe';
import {FilterPipe} from './filter.pipe';
import {LimitPipe} from './limit.pipe';
import {ArrayObjectSortPipe} from './array-object-sort.pipe';
import {SetStringSortPipe} from './set-string-sort.pipe';
import {OrderObjectByBestPathScorePipe} from '../paths/order-object-by-best-path-score.pipe';
import {FlattenPathsPipe} from '../paths/flatten-paths.pipe';
import {LimitObjectsPipe} from './limit-objects.pipe';
import {OrderBySegmentIdPipe} from './order-by-segment-id.pipe';
import {OrderByPipe} from './order-by.pipe';

@NgModule({
  imports: [],
  // tslint:disable-next-line:max-line-length
  declarations: [OrderBySegmentPipe, FlattenPathsPipe, OrderObjectByBestPathScorePipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe, LimitObjectsPipe, OrderBySegmentIdPipe, OrderByPipe],
  // tslint:disable-next-line:max-line-length
  exports: [OrderBySegmentPipe, FlattenPathsPipe, OrderObjectByBestPathScorePipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe, LimitObjectsPipe, OrderBySegmentIdPipe, OrderByPipe]
})
export class ContainerPipesModule {
}
