import {NgModule} from '@angular/core';
import {OrderBySegmentPipe} from './containers/order-by-segment.pipe';
import {OrderByScorePipe} from './containers/order-by-score.pipe';
import {FilterPipe} from './containers/filter.pipe';
import {LimitPipe} from './containers/limit.pipe';
import {ArrayObjectSortPipe} from './containers/array-object-sort.pipe';
import {SetStringSortPipe} from './containers/set-string-sort.pipe';
import {FlattenPathsPipe} from './paths/flatten-paths.pipe';
import {LimitObjectsPipe} from './containers/limit-objects.pipe';
import {OrderBySegmentIdPipe} from './containers/order-by-segment-id.pipe';
import {OrderByPipe} from './containers/order-by.pipe';
import {LimitPathsPipe} from './containers/limit-paths.pipe';
import {DresEnabledPipe} from './preferences/dres-enabled.pipe';
import {GetConfigVariablePipe} from './preferences/get-config-variable.pipe';
import {ObjectFilterTemporalPipe} from './util/object-filter-temporal.pipe';

@NgModule({
  imports: [],
  // tslint:disable-next-line:max-line-length
  declarations: [ObjectFilterTemporalPipe, GetConfigVariablePipe, DresEnabledPipe, OrderBySegmentPipe, FlattenPathsPipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe, LimitObjectsPipe, LimitPathsPipe, OrderBySegmentIdPipe, OrderByPipe],
  // tslint:disable-next-line:max-line-length
  exports: [ObjectFilterTemporalPipe, GetConfigVariablePipe, DresEnabledPipe, OrderBySegmentPipe, FlattenPathsPipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe, LimitObjectsPipe, LimitPathsPipe, OrderBySegmentIdPipe, OrderByPipe]
})
export class PipesModule {
}
