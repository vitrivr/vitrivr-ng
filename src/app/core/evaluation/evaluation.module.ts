
import {HttpClientModule} from "@angular/common/http";
import {NgModule} from "@angular/core";
import {EvaluationService} from "./evaluation.service";

@NgModule({
    imports:      [ HttpClientModule ],
    declarations: [ ],
    providers:    [ EvaluationService ]
})

export class EvaluationModule { }