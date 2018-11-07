import {NgModule}      from '@angular/core';
import {OrderBySegmentPipe} from "./order-by-segment.pipe";
import {OrderByScorePipe} from "./order-by-score.pipe";
import {FilterPipe} from "./filter.pipe";
import {LimitPipe} from "./limit.pipe";
@NgModule({
    imports:      [  ],
    declarations: [ OrderBySegmentPipe, OrderByScorePipe, FilterPipe, LimitPipe ],
    exports: [ OrderBySegmentPipe, OrderByScorePipe, FilterPipe, LimitPipe]
})
export class ContainerPipesModule { }
