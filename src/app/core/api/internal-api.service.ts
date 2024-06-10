import { Injectable } from '@angular/core';
import {InformationNeedDescription, InputData, OperatorDescription, QueryContext, RetrievalService} from '../../../../openapi/vitrivr-engine';

@Injectable()
export class InternalApiService {

  constructor(private _retrieval: RetrievalService) { }

  query(ind: InformationNeedDescription){
    return this._retrieval.postExecuteQuery("LSC", ind) // TODO make schema configurable
  }



}
