import {NgModule}      from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {VbsSubmissionService} from "./vbs-submission.service";

@NgModule({
    imports:      [ HttpClientModule ],
    declarations: [ ],
    providers:    [ VbsSubmissionService ]
})

export class VbsModule { }
