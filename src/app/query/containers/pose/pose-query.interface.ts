/**
 * A pose query composed of one to many {@link Skeleton}s.
 */
export interface PoseQuery {
  /** List of {@link Skeleton}s that make up this {@link PoseQuery}. */
  poses: Array<Skeleton>;

  /** Image representation of this {@link PoseQuery}. */
  image?: string
}

/**
 * A {@link Skeleton} described by 16 key points (COCO format).
 */
export interface Skeleton {
  nose: Joint;
  left_eye: Joint;
  right_eye: Joint;
  left_ear: Joint;
  right_ear: Joint;
  left_shoulder: Joint;
  right_shoulder: Joint;
  left_elbow: Joint;
  right_elbow: Joint;
  left_wrist: Joint;
  right_wrist: Joint;
  left_hip: Joint;
  right_hip: Joint;
  left_knee: Joint;
  right_knee: Joint;
  left_ankle: Joint;
  right_ankle: Joint;
}


/**
 * A {@link Joint} used to describe a {@link Skeleton}.
 */
export interface Joint {
  x: number;
  y: number;
  disable: boolean;
}
