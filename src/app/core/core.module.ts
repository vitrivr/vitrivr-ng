import {NgModule} from '@angular/core';
import {LookupModule} from './lookup/lookup.module';
import {EvaluationService} from './evaluation/evaluation.service';
import {BasicModule} from './basics/basic.module';
import {EvaluationModule} from '../evaluation/evaluation.module';
import {TagsLookupService} from './lookup/tags-lookup.service';
import {VbsSubmissionService} from './vbs/vbs-submission.service';
import {VbsModule} from './vbs/vbs.module';
import {SelectionModule} from './selection/selection.module';
import {SelectionService} from './selection/selection.service';
import {WebSocketFactoryService} from './api/web-socket-factory.service';
import {QueryModule} from './queries/query.module';
import {PreviousRouteService} from './basics/previous-route.service';

@NgModule({
  imports: [LookupModule, BasicModule, EvaluationModule, VbsModule, SelectionModule, QueryModule],
  exports: [LookupModule, BasicModule, EvaluationModule, VbsModule, SelectionModule, QueryModule],
  declarations: [],
  providers: [TagsLookupService, WebSocketFactoryService, EvaluationService, VbsSubmissionService, SelectionService, PreviousRouteService]
})
export class CoreModule {
}
