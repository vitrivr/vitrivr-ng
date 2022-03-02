/**
 * A pose query composed of one to many {@link Pose}s.
 */
export interface PoseQuery {
  poses: Array<Pose> /* List of. */
}

/**
 * A {@link Pose} described by 16 key points (COCO format).
 */
export interface Pose {
  nose: Point;
  left_eye: Point;
  right_eye: Point;
  left_ear: Point;
  right_ear: Point;
  left_shoulder: Point;
  right_shoulder: Point;
  left_elbow: Point;
  right_elbow: Point;
  left_wrist: Point;
  right_wrist: Point;
  left_hip: Point;
  right_hip: Point;
  left_knee: Point;
  right_knee: Point;
  left_ankle: Point;
  right_ankle: Point;
}


/**
 * A {@link Point} used to describe a {@link Pose}.
 */
export interface Point {
  x: number;
  y: number;
  disable: boolean;
}
