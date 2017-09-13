import {NgModule}      from '@angular/core';
import {OrderBySegmentPipe} from "./order-by-segment.pipe";
import {OrderByScorePipe} from "./order-by-score.pipe";
@NgModule({
    imports:      [  ],
    declarations: [ OrderBySegmentPipe, OrderByScorePipe ],
    exports: [ OrderBySegmentPipe, OrderByScorePipe ]
})
export class ContainerPipesModule { }
