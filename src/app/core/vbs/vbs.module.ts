import {NgModule}      from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {VbsSubmissionService} from "./vbs-submission.service";
import {VbsSequenceLoggerService} from "./vbs-sequence-logger.service";

@NgModule({
    imports:      [ HttpClientModule ],
    declarations: [ ],
    providers:    [ VbsSubmissionService, VbsSequenceLoggerService ]
})

export class VbsModule { }
