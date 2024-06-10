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
import { ApiScoreSeriesPoint } from './apiScoreSeriesPoint';


export interface ApiScoreSeries { 
    team: string;
    name: string;
    points: Array<ApiScoreSeriesPoint>;
}

