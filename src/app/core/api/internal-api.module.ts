import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppConfig} from '../../app.config';
import {HttpClientModule} from '@angular/common/http';
import {ApiModule, Configuration} from '../../../../openapi/vitrivr-engine';
import {InternalApiService} from './internal-api.service';



@NgModule({
  declarations: [],
  imports: [ApiModule.forRoot(() => {
    return new Configuration({basePath: AppConfig.settings.engineEndpointRest});
  }), HttpClientModule,
    CommonModule
  ],
  providers:[
    InternalApiService
  ]
})
export class InternalApiModule { }
