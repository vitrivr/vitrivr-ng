import {NgModule}      from '@angular/core';
import {QueryService} from "./queries/query.service";
import {CineastAPI} from "./api/cineast-api.service";
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

@NgModule({
    imports:      [ LookupModule, BasicModule, EvaluationModule, VbsModule, SelectionModule ],
    exports:      [ LookupModule, BasicModule, EvaluationModule, VbsModule, SelectionModule ],
    declarations: [ ],
    providers:    [ TagsLookupService, QueryService, ConfigService, ResolverService, CineastAPI, EvaluationService, VbsSubmissionService, SelectionService ]
})
export class CoreModule { }
