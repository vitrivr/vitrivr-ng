import {NgModule}      from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {VbsSubmissionService} from "./vbs-submission.service";
import {MaterialModule} from "../../material.module";

@NgModule({
    imports:      [ HttpClientModule, MaterialModule ],
    declarations: [ ],
    providers:    [ VbsSubmissionService ]
})
export class VbsModule {}
