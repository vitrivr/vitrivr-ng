import {NgModule} from '@angular/core';
import {OrderBySegmentPipe} from './order-by-segment.pipe';
import {OrderByScorePipe} from './order-by-score.pipe';
import {FilterPipe} from './filter.pipe';
import {LimitPipe} from './limit.pipe';
import {ArrayObjectSortPipe} from './array-object-sort.pipe';
import {SetStringSortPipe} from './set-string-sort.pipe';
import {OrderObjectByBestPathScorePipe} from '../paths/order-object-by-best-path-score.pipe';
import {FlattenPathsPipe} from '../paths/flatten-paths.pipe';

@NgModule({
    imports: [],
    declarations: [OrderBySegmentPipe, FlattenPathsPipe, OrderObjectByBestPathScorePipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe],
    exports: [OrderBySegmentPipe, FlattenPathsPipe, OrderObjectByBestPathScorePipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe]
})
export class ContainerPipesModule {
}
