import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {VbsSubmissionService} from './vbs-submission.service';
import {MaterialModule} from '../../material.module';
import {CollabordinatorService} from './collabordinator.service';

@NgModule({
  imports: [HttpClientModule, MaterialModule],
  declarations: [],
  providers: [VbsSubmissionService, CollabordinatorService]
})
export class VbsModule {
}
