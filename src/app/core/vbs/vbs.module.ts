import {NgModule}      from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {VbsSubmissionService} from "./vbs-submission.service";
import {VbsSequenceLoggerService} from "./vbs-sequence-logger.service";
import {MaterialModule} from "../../material.module";

@NgModule({
    imports:      [ HttpClientModule, MaterialModule ],
    declarations: [ ],
    providers:    [ VbsSubmissionService, VbsSequenceLoggerService ]
})

export class VbsModule { }
