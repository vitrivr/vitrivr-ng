import {NgModule} from '@angular/core';
import {OrderBySegmentPipe} from './order-by-segment.pipe';
import {OrderByScorePipe} from './order-by-score.pipe';
import {FilterPipe} from './filter.pipe';
import {LimitPipe} from './limit.pipe';
import {ArrayObjectSortPipe} from './array-object-sort.pipe';
import {SetStringSortPipe} from './set-string-sort.pipe';
import {OrderPathByScorePipe} from '../paths/order-path-by-score.pipe';
import {OrderObjectByBestPathScorePipe} from '../paths/order-object-by-best-path-score.pipe';

@NgModule({
    imports: [],
    declarations: [OrderBySegmentPipe, OrderPathByScorePipe, OrderObjectByBestPathScorePipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe],
    exports: [OrderBySegmentPipe, OrderPathByScorePipe, OrderObjectByBestPathScorePipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe]
})
export class ContainerPipesModule {
}
