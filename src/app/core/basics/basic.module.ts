import {NgModule}      from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {ConfigService} from "./config.service";
import {ResolverService} from "./resolver.service";

@NgModule({
    imports:      [ HttpClientModule ],
    declarations: [ ],
    providers:    [ ConfigService, ResolverService ]
})

export class BasicModule { }
