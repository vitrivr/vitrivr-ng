import {NgModule}      from '@angular/core';
import {QueryService} from "./queries/query.service";
import {CineastAPI} from "./api/cineast-api.service";
import {ConfigService} from "./basics/config.service";
import {LookupModule} from "./lookup/lookup.module";
import {ResolverService} from "./basics/resolver.service";
import {EvaluationService} from "./evaluation/evaluation.service";
import {BasicModule} from "./basics/basic.module";
import {EvaluationModule} from "../evaluation/evaluation.module";

@NgModule({
    imports:      [ LookupModule, BasicModule, EvaluationModule ],
    exports:      [ LookupModule, BasicModule, EvaluationModule ],
    declarations: [ ],
    providers:    [ QueryService, ConfigService, ResolverService, CineastAPI, EvaluationService ]
})

export class CoreModule { }
