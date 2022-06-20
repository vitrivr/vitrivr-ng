import {NgModule} from '@angular/core';
import {LookupModule} from './lookup/lookup.module';
import {BasicModule} from './basics/basic.module';
import {VbsSubmissionService} from './competition/vbs-submission.service';
import {CompetitionModule} from './competition/competition.module';
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
  }), LookupModule, BasicModule, CompetitionModule, SelectionModule, QueryModule],
  exports: [ApiModule, LookupModule, BasicModule, CompetitionModule, SelectionModule, QueryModule],
  declarations: [],
  providers: [WebSocketFactoryService, VbsSubmissionService, SelectionService, PreviousRouteService]
})
export class CoreModule {
}
