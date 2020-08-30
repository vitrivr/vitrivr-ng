import {AbstractQueryTerm} from './abstract-query-term.model';
import {PoseKeypoints} from '../pose/pose-keypoints.model';

export class PoseQueryTerm extends AbstractQueryTerm {

  constructor() {
    super('POSE', ['poselit']);
  }

  update(pose: PoseKeypoints, mode: string, orientations: [boolean, boolean], semantic: boolean) {
    if (semantic) {
      this.setCategories(['posesem']);
    } else {
      this.setCategories(['poselit']);
    }
    this.data = (
      'data:application/json;base64,' +
      btoa(JSON.stringify({pose, mode, orientations}))
    );
  }
}
