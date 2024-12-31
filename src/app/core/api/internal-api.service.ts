import { Injectable } from '@angular/core';
import {InformationNeedDescription, InputData, OperatorDescription, QueryContext, RetrievalService} from '../../../../openapi/vitrivr-engine';
import {ConfigService} from '../basics/config.service';
import {config} from 'rxjs';
import {AppConfig} from '../../app.config';

@Injectable()
export class InternalApiService {

  //private schema: string = "mvk";
  constructor(private _retrieval: RetrievalService, private config: AppConfig) {
    // config.configAsObservable.subscribe(config => {
    //   this.schema = config.schema;
    // });
  }

  query(ind: InformationNeedDescription){
    return this._retrieval.postExecuteQuery(this.config.config.schema, ind)
  }



}
