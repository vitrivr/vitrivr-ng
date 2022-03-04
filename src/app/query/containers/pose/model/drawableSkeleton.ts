import {Skeleton} from '../pose-query.interface';
import Two from 'two.js';
import {DrawableJoint} from './drawableJoint';

export class DrawableSkeleton extends Two.Group implements Skeleton {

  /** Connections within a {@link DrawableSkeleton}. */
  public static CONNECTIONS = [
    [15, 13], [13, 11], [16, 14], [14, 12], [11, 12], [5, 11], [6, 12], [5, 6], [5, 7],
    [6, 8], [7, 9], [8, 10], [1, 2], [0, 1], [0, 2], [1, 3], [2, 4], [0, 5], [0, 6]
  ]

  /** The default {@link Skeleton}. */
  public static DEFAULT = <Skeleton>{
    nose: {x: 0.15, y: 0.020 , disable: false},
    left_eye: {x: 0.125 , y: 0.00, disable: false},
    right_eye: {x: 0.175 , y: 0.00 , disable: false},
    left_ear: {x: 0.100 , y: 0.01 , disable: false},
    right_ear: {x: 0.200, y: 0.01, disable: false},
    left_shoulder: {x: 0.05, y: 0.075, disable: false},
    right_shoulder: {x: 0.25, y: 0.075, disable: false},
    left_elbow: {x: 0.00, y: 0.15, disable: false},
    right_elbow: {x: 0.30, y: 0.15, disable: false},
    left_wrist: {x: 0.00, y: 0.25, disable: false},
    right_wrist: {x: 0.30, y: 0.25, disable: false},
    left_hip: {x: 0.075, y: 0.35, disable: false},
    right_hip: {x: 0.225, y: 0.35, disable: false},
    left_knee: {x: 0.05, y: 0.50, disable: false},
    right_knee: {x: 0.25, y: 0.50, disable: false},
    left_ankle: {x: 0.075, y: 0.65, disable: false},
    right_ankle: {x: 0.225, y: 0.65, disable: false}
  }

  /** */
  public joints: Array<DrawableJoint>;


  /** Constructor for {@link DrawableSkeleton}. */
  constructor(skeleton: Skeleton = DrawableSkeleton.DEFAULT, scalingFactor = 1.0) {
    const joints = [
      skeleton.nose, skeleton.left_ear, skeleton.right_ear, skeleton.left_eye, skeleton.right_eye, skeleton.left_shoulder,
      skeleton.right_shoulder, skeleton.left_elbow, skeleton.right_elbow, skeleton.left_wrist, skeleton.right_wrist, skeleton.left_hip,
      skeleton.right_hip, skeleton.left_knee, skeleton.right_knee, skeleton.left_ankle, skeleton.right_ankle
    ]

    /* Prepare elements to add. */
    const drawableJoints = [];
    const elements = []
    for (const joint of joints) {
      const j = new DrawableJoint(joint.x * scalingFactor, joint.y * scalingFactor)
      drawableJoints.push(j)
      elements.push(j);
    }

    /** Add connections. */
    for (const connection of DrawableSkeleton.CONNECTIONS) {
      const path = new Two.Path(connection.map(p => elements[p].position), false, false, true)
      path.linewidth = 2
      if (!path.vertices.every(p => !p.disable)) {
        path.stroke = '#AAAAAA'
      } else {
        path.stroke = '#000000'
      }
      elements.push(path)
    }

    super(elements)
    this.joints = drawableJoints;
  }

  get nose(): DrawableJoint {
      return this.children[0]
  }

  get left_ear(): DrawableJoint {
    return this.children[1]
  }

  get right_ear(): DrawableJoint {
    return this.children[2]
  }

  get left_eye(): DrawableJoint {
    return this.children[3]
  }

  get right_eye(): DrawableJoint {
    return this.children[4]
  }

  get left_shoulder(): DrawableJoint {
    return this.children[5]
  }

  get right_shoulder(): DrawableJoint {
    return this.children[6]
  }

  get left_elbow(): DrawableJoint {
    return this.children[7]
  }

  get right_elbow(): DrawableJoint {
    return this.children[8]
  }

  get left_wrist(): DrawableJoint {
    return this.children[9]
  }

  get right_wrist(): DrawableJoint {
    return this.children[10]
  }

  get left_hip(): DrawableJoint {
    return this.children[11]
  }

  get right_hip(): DrawableJoint {
    return this.children[12]
  }

  get left_knee(): DrawableJoint {
    return this.children[13]
  }

  get right_knee(): DrawableJoint {
    return this.children[14]
  }

  get left_ankle(): DrawableJoint {
    return this.children[15]
  }

  get right_ankle(): DrawableJoint {
    return this.children[16]
  }
}
