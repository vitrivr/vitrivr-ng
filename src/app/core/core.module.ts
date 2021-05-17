import {NgModule} from '@angular/core';
import {LookupModule} from './lookup/lookup.module';
import {EvaluationService} from './evaluation/evaluation.service';
import {BasicModule} from './basics/basic.module';
import {EvaluationModule} from '../evaluation/evaluation.module';
import {VbsSubmissionService} from './vbs/vbs-submission.service';
import {VbsModule} from './vbs/vbs.module';
import {SelectionModule} from './selection/selection.module';
import {SelectionService} from './selection/selection.service';
import {WebSocketFactoryService} from './api/web-socket-factory.service';
import {QueryModule} from './queries/query.module';
import {PreviousRouteService} from './basics/previous-route.service';
import {ApiModule, Configuration} from '../../../openapi/cineast';
import {AppConfig} from '../app.config';

@NgModule({
  imports: [ApiModule.forRoot(() => {
    return new Configuration({
      basePath: `${AppConfig.settings.cineastEndpointRest}`
    })
  }), LookupModule, BasicModule, EvaluationModule, VbsModule, SelectionModule, QueryModule],
  exports: [ApiModule, LookupModule, BasicModule, EvaluationModule, VbsModule, SelectionModule, QueryModule],
  declarations: [],
  providers: [WebSocketFactoryService, EvaluationService, VbsSubmissionService, SelectionService, PreviousRouteService]
})
export class CoreModule {
}
