import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Pose, PoseQuery} from "./pose-query.interface";
import Two from "two.js";

@Component({
  selector: 'app-pose-sketchpad',
  templateUrl: 'pose-sketch-dialog.component.html',
  styleUrls: ['pose-sketch-dialog.component.scss']
})

export class PoseSketchDialogComponent implements AfterViewInit {

  /** The {@link PoseQuery} instance handled by this {@link PoseSketchDialogComponent}- */
  private query: PoseQuery

  /** Hidden input for image upload. */
  @ViewChild('canvas', {static: true})
  private canvas: ElementRef;

  /** The {@link Two} object used for drawing. */
  private two: Two


  /**
   * Constructor for SketchDialogComponent.
   */
  constructor(private _dialogRef: MatDialogRef<PoseSketchDialogComponent>, @Inject(MAT_DIALOG_DATA) _data: PoseQuery) {
    this._dialogRef.disableClose = true;
    if (_data != null) {
      this.query = _data
    } else {
      this.query = <PoseQuery>{ poses: [] }
    }
  }

  /**
   * Lifecycle Hook (afterViewInit): Sets the default line size and colour.
   */
  public ngAfterViewInit(): void {
    this.two = new Two({
      type: Two.Types.canvas,
      width: 600,
      height: 600,
      autostart: true
    }).appendTo(this.canvas.nativeElement);
  }

  /**
   * Adds a new {@link Pose} to this {@link PoseQuery}.
   */
  public addPose() {
    this.query.poses.push(<Pose>{
      nose: {x: 0.5, y: 0.05, disable: false},
      left_eye: {x: 0.475, y: 0.020, disable: false},
      right_eye: {x: 0.525, y: 0.020, disable: false},
      left_ear: {x: 0.45, y: 0.020, disable: false},
      right_ear: {x: 0.55, y: 0.020, disable: false},
      left_shoulder: {x: 0.40, y: 0.10, disable: false},
      right_shoulder: {x: 0.60, y: 0.10, disable: false},
      left_elbow: {x: 0.35, y: 0.20, disable: false},
      right_elbow: {x: 0.65, y: 0.20, disable: false},
      left_wrist: {x: 0.35, y: 0.30, disable: false},
      right_wrist: {x: 0.65, y: 0.30, disable: false},
      left_hip: {x: 0.425, y: 0.40, disable: false},
      right_hip: {x: 0.575, y: 0.40, disable: false},
      left_knee: {x: 0.40, y: 0.55, disable: false},
      right_knee: {x: 0.60, y: 0.55, disable: false},
      left_ankle: {x: 0.425, y: 0.70, disable: false},
      right_ankle: {x: 0.575, y: 0.70, disable: false}
    });
    this.redraw()
  }

  /**
   * Closes the dialog.
   */
  public close() {
    this._dialogRef.close(this.query);
  }

  /**
   * Redraws the preview image.
   */
  private redraw() {
    const scale = Math.min(this.two.width, this.two.height)
    const connections = [
      [15, 13], [13, 11], [16, 14], [14, 12], [11, 12], [5, 11], [6, 12], [5, 6], [5, 7],
      [6, 8], [7, 9], [8, 10], [1, 2], [0, 1], [0, 2], [1, 3], [2, 4], [0, 5], [0, 6]
    ]

    /* Now draw every pose. */
    for (let pose of this.query.poses) {
      /* Prepare group and points. */
      const elements = []

      /* Prepare points for active and inactive joints. */
      const active = new Two.Points()
      active._size = 8;
      active.stroke = '#00AEFF';
      elements.push(active)

      const inactive = new Two.Points()
      inactive._size = 8;
      inactive.stroke = '#AAAAAA';
      elements.push(inactive)

      /** Add joints of the skeleton. */
      const joints = [
        pose.nose, pose.left_ear, pose.right_ear, pose.left_eye, pose.right_eye, pose.left_shoulder,
        pose.right_shoulder, pose.left_elbow, pose.right_elbow, pose.left_wrist, pose.right_wrist, pose.left_hip,
        pose.right_hip, pose.left_knee, pose.right_knee, pose.left_ankle, pose.right_ankle
      ]
      const points = []
      for (let joint of joints) {
        const point = new Two.Anchor(joint.x * scale, joint.y * scale, 0, 0, 0, 0, Two.Commands.line)
        points.push(point)
        if (joint.disable) {
          inactive.vertices.push(point)
        } else {
          active.vertices.push(point)
        }
      }

      /** Add connections. */
      for (let connection of connections) {
        let anchors = connection.map(p => points[p])
        let path = new Two.Path(anchors, false, false, true)
        if (!connection.every(p => !joints[p].disable)) {
          path.stroke = '#AAAAAA'
          path.linewidth = 2
        }
        elements.push(path)
      }

      /** Add group to canvas. */
      this.two.makeGroup(elements)
    }
  }
}
