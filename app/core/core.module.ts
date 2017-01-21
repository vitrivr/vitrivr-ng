import {NgModule}      from '@angular/core';
import {QueryService} from "./queries/queries.service";
import {CineastAPI} from "./api/cineast-api.service";
import {ConfigService} from "./config.service";

@NgModule({
    imports:      [ ],
    declarations: [ ],
    providers:    [ QueryService,  ConfigService, CineastAPI ]
})

export class CoreModule { }
