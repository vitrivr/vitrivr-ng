import {AbstractQueryTerm} from './abstract-query-term.model';
import {PoseKeypoints} from '../pose/pose-keypoints.model';

export class PoseQueryTerm extends AbstractQueryTerm {

  constructor() {
    super('POSE', ['pose']);
  }

  update(pose: PoseKeypoints, mode: string) {
    this.data = (
      'data:application/json;base64,' +
      btoa(JSON.stringify({pose, mode}))
    );
  }
}
