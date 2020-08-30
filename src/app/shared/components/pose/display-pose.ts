import modelPose from './pose.json';

export class DisplayPose {
  public width: number;
  public height: number;
  public keypoints: Array<[number, number, number]>;

  constructor(keypoints: Array<[number, number, number]>, targetWidth: number, padding: number) {
    this.width = targetWidth;
    [this.height, this.keypoints] = rescalePose(keypoints, targetWidth, padding);
  }
}

function rescalePose(pose: [number, number, number][], targetWidth: number, padding: number): [number, [number, number, number][]] {
  const xs = pose.map((arr) => arr[0]);
  const ys = pose.map((arr) => arr[1]);
  const miX = Math.min(...xs) - padding;
  const mxX = Math.max(...xs) + padding;
  const rngX = mxX - miX;
  const miY = Math.min(...ys) - padding;
  const mxY = Math.max(...ys) + padding;
  const rngY = mxY - miY;
  const height = targetWidth * rngY / rngX;
  return [
    height,
    pose.map(
      (arr) => [(arr[0] - miX) / rngX * targetWidth, (arr[1] - miY) / rngY * height, arr[2]] as [number, number, number]
    )
  ];
}

function getModelPoseBit(key: string): [number, number, number][] {
  return modelPose[key].map(x => [...x, 1]);
}

export function mkModelPose(targetWidth, padding): DisplayPose {
  const pose = getModelPoseBit('pose_keypoints_2d');
  const lhand = getModelPoseBit('hand_left_keypoints_2d');
  const rhand = getModelPoseBit('hand_right_keypoints_2d');
  const origPoints = [
    ...pose,
    ...lhand.slice(1),
    ...rhand.slice(1)
  ];
  return new DisplayPose(origPoints, targetWidth, padding);
}
