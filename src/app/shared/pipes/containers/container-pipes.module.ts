import {NgModule}      from '@angular/core';
import {OrderBySegmentPipe} from './order-by-segment.pipe';
import {OrderByScorePipe} from './order-by-score.pipe';
import {FilterPipe} from './filter.pipe';
import {LimitPipe} from './limit.pipe';
import {ArrayObjectSortPipe} from './array-object-sort.pipe';
import {SetStringSortPipe} from './set-string-sort.pipe';
@NgModule({
    imports:      [  ],
    declarations: [ OrderBySegmentPipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe ],
    exports: [ OrderBySegmentPipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe]
})
export class ContainerPipesModule { }
