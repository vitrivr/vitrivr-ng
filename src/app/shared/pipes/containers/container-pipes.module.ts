import {NgModule}      from '@angular/core';
import {OrderBySegmentPipe} from "./order-by-segment.pipe";
import {OrderByScorePipe} from "./order-by-score.pipe";
import {FilterObjectAllPipe} from "./filter-object-all-pipe";
import {FilterSegmentAllPipe} from "./filter-segment-all-pipe";
@NgModule({
    imports:      [  ],
    declarations: [ OrderBySegmentPipe, OrderByScorePipe, FilterObjectAllPipe, FilterSegmentAllPipe ],
    exports: [ OrderBySegmentPipe, OrderByScorePipe, FilterObjectAllPipe, FilterSegmentAllPipe]
})
export class ContainerPipesModule { }
