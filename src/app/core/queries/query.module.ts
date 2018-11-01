import {NgModule} from "@angular/core";
import {QueryService} from "./query.service";
import {FilterService} from "./filter.service";

@NgModule({
    imports:      [ ],
    declarations: [ ],
    providers:    [ QueryService, FilterService ]
})
export class QueryModule { }
