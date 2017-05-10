import {NgModule}      from '@angular/core';
import {QueryService} from "./queries/query.service";
import {CineastAPI} from "./api/cineast-api.service";
import {ConfigService} from "./basics/config.service";
import {LookupModule} from "./lookup/lookup.module";
import {ResolverService} from "./basics/resolver.service";
import {StorageService} from "./basics/storage.service";
import {EvaluationService} from "./evaluation/evaluation.service";

@NgModule({
    imports:      [ LookupModule ],
    exports:      [ LookupModule ],
    declarations: [ ],
    providers:    [ QueryService, ConfigService, ResolverService, CineastAPI, StorageService, EvaluationService ]
})

export class CoreModule { }
