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

@NgModule({
    imports:      [ LookupModule, BasicModule, EvaluationModule, VbsModule ],
    exports:      [ LookupModule, BasicModule, EvaluationModule, VbsModule ],
    declarations: [ ],
    providers:    [ TagsLookupService, QueryService, ConfigService, ResolverService, CineastAPI, EvaluationService, VbsSubmissionService ]
})

export class CoreModule { }
