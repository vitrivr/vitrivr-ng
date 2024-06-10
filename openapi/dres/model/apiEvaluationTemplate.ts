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
import { ApiTaskGroup } from './apiTaskGroup';
import { ApiTaskTemplate } from './apiTaskTemplate';
import { ApiTeam } from './apiTeam';
import { ApiTaskType } from './apiTaskType';
import { ApiTeamGroup } from './apiTeamGroup';


export interface ApiEvaluationTemplate { 
    id: string;
    name: string;
    description?: string;
    created?: number;
    modified?: number;
    taskTypes: Array<ApiTaskType>;
    taskGroups: Array<ApiTaskGroup>;
    tasks: Array<ApiTaskTemplate>;
    teams: Array<ApiTeam>;
    teamGroups: Array<ApiTeamGroup>;
    judges: Array<string>;
    viewers: Array<string>;
}

