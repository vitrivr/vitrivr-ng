import {VbsResult} from "./vbs-result.model";
import {VbsInteraction} from "./vbs-interaction.model";

export interface VbsSubmission {
    teamId: string;
    memberId: number;
    timestamp: number;
    type: SubmissionType;
    events?: VbsInteraction[];
    results?: VbsResult[];
}

export type SubmissionType = 'interaction' | 'result';
