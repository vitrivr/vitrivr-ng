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


export type ApiSubmissionOption = 'NO_DUPLICATES' | 'LIMIT_CORRECT_PER_TEAM' | 'LIMIT_WRONG_PER_TEAM' | 'LIMIT_TOTAL_PER_TEAM' | 'LIMIT_CORRECT_PER_MEMBER' | 'TEMPORAL_SUBMISSION' | 'TEXTUAL_SUBMISSION' | 'ITEM_SUBMISSION' | 'MINIMUM_TIME_GAP';

export const ApiSubmissionOption = {
    NO_DUPLICATES: 'NO_DUPLICATES' as ApiSubmissionOption,
    LIMIT_CORRECT_PER_TEAM: 'LIMIT_CORRECT_PER_TEAM' as ApiSubmissionOption,
    LIMIT_WRONG_PER_TEAM: 'LIMIT_WRONG_PER_TEAM' as ApiSubmissionOption,
    LIMIT_TOTAL_PER_TEAM: 'LIMIT_TOTAL_PER_TEAM' as ApiSubmissionOption,
    LIMIT_CORRECT_PER_MEMBER: 'LIMIT_CORRECT_PER_MEMBER' as ApiSubmissionOption,
    TEMPORAL_SUBMISSION: 'TEMPORAL_SUBMISSION' as ApiSubmissionOption,
    TEXTUAL_SUBMISSION: 'TEXTUAL_SUBMISSION' as ApiSubmissionOption,
    ITEM_SUBMISSION: 'ITEM_SUBMISSION' as ApiSubmissionOption,
    MINIMUM_TIME_GAP: 'MINIMUM_TIME_GAP' as ApiSubmissionOption
};
