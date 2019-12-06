import {SubmittedEvent} from './event.model';
export interface Submission {
    teamId: string;
    memberId: number;
    timestamp: number;
    type: SubmissionType;
    events: SubmittedEvent[] ;
}

export type SubmissionType = 'interaction' | 'result';
