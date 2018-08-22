import {NgModule}      from '@angular/core';
import {QueryService} from "./queries/query.service";
import {ConfigService} from "./basics/config.service";
import {LookupModule} from "./lookup/lookup.module";
import {ResolverService} from "./basics/resolver.service";
import {EvaluationService} from "./evaluation/evaluation.service";
import {BasicModule} from "./basics/basic.module";
import {EvaluationModule} from "../evaluation/evaluation.module";
import {TagsLookupService} from "./lookup/tags-lookup.service";
import {VbsSubmissionService} from "./vbs/vbs-submission.service";
import {VbsModule} from "./vbs/vbs.module";
import {SelectionModule} from "./selection/selection.module";
import {SelectionService} from "./selection/selection.service";
import {WebSocketFactoryService} from "./api/web-socket-factory.service";
import {PingService} from "./queries/ping.service";

@NgModule({
    imports:      [ LookupModule, BasicModule, EvaluationModule, VbsModule, SelectionModule ],
    exports:      [ LookupModule, BasicModule, EvaluationModule, VbsModule, SelectionModule ],
    declarations: [ ],
    providers:    [ TagsLookupService, QueryService, ConfigService, ResolverService, WebSocketFactoryService, EvaluationService, VbsSubmissionService, SelectionService, PingService ]
})
export class CoreModule { }
