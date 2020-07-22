export interface PoseData {
  keypoints: Array<[number, number, number]>;
  leftSide: boolean;
  rightSide: boolean;
  mode: string;
}
