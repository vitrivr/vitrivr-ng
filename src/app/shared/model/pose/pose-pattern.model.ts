import {PoseKeypoints} from './pose-keypoints.model';

export interface PosePattern {
  keypoints: PoseKeypoints;
  leftSide: boolean;
  rightSide: boolean;
  mode: string;
}
