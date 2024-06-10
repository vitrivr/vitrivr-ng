/**
 * DRES Client API
 * Client API for DRES (Distributed Retrieval Evaluation Server), Version 2.0.3
 *
 * The version of the OpenAPI document: 2.0.3
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { ApiClientTaskTemplateInfo } from './apiClientTaskTemplateInfo';
import { ApiEvaluationStatus } from './apiEvaluationStatus';
import { ApiEvaluationType } from './apiEvaluationType';


export interface ApiClientEvaluationInfo { 
    id: string;
    name: string;
    type: ApiEvaluationType;
    status: ApiEvaluationStatus;
    templateId: string;
    templateDescription?: string;
    teams: Array<string>;
    taskTemplates: Array<ApiClientTaskTemplateInfo>;
}

