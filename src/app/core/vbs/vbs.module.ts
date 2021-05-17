import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {VbsSubmissionService} from './vbs-submission.service';
import {MaterialModule} from '../../material.module';
import {CollabordinatorService} from './collabordinator.service';
import {ApiModule, Configuration} from '../../../../openapi/dres';
import {AppConfig} from '../../app.config';

@NgModule({
  imports: [ApiModule.forRoot(() => {
      return new Configuration({basePath: AppConfig.settings.dresEndpointRest, withCredentials: true});
    }), HttpClientModule, MaterialModule],
  declarations: [],
  providers: [VbsSubmissionService, CollabordinatorService]
})
export class VbsModule { }
