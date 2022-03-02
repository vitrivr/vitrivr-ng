import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Joint, Pose, PoseQuery} from "./pose-query.interface";
import Two from "two.js";
import {Group} from "two.js/src/group";
import {Circle} from "two.js/src/shapes/circle";
import {Path} from "two.js/src/path";
import {Rectangle} from "two.js/src/shapes/rectangle";

/**
 * Internal class that acts both as {@link Anchor} and {@link Joint}
 */
class JointAnchor extends Two.Anchor implements Joint {
  constructor(x?: number, y?: number, ax?: number, ay?: number, bx?: number, by?: number, command?: string) {
    super(x, y, ax, ay, bx, by, command);
  }
  disable: boolean = false;
}

@Component({
  selector: 'app-pose-sketchpad',
  templateUrl: 'pose-sketch-dialog.component.html',
  styleUrls: ['pose-sketch-dialog.component.scss']
})
export class PoseSketchDialogComponent implements AfterViewInit {

  /** The {@link PoseQuery} instance handled by this {@link PoseSketchDialogComponent}- */
  private readonly query: PoseQuery

  /** Hidden input for image upload. */
  @ViewChild('canvas', {static: true})
  private canvas: ElementRef;

  /** The {@link Two} object used for drawing. */
  private two: Two

  /** List of all {@link Group}s that correspond to a {@link Pose}. */
  private poses: Array<Group> = []

  /** The {@link Vector} used to track the mouse. */
  private mouse = new Two.Vector();

  /** Flag indicating, that cursor is currently dragging. */
  private dragging: boolean = false

  /** */
  private interactionGroup: Group

  /** The {@link Rectangle} used to indicate the bounding box of a {@link Pose}. */
  private selectRect: Rectangle

  /** The currently selected {@link Group} that stands for a {@link Pose}. */
  private currentPose: Group = null

  /** The {@link Circle} used to track the mouse. */
  private selectCircle: Circle

  /** The currently selected {@link Anchor} within a {@link Group}. */
  private currentPoint: JointAnchor = null

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



    /** Create selection circle. */
    this.selectCircle = this.two.makeCircle(0, 0, 4)
    this.selectCircle.visible = false
    this.selectCircle.stroke = '#FF69B4'

    /** Create selection rectangle. */
    this.selectRect = this.two.makeRectangle(0, 0, 0, 0)
    this.selectRect.visible = false
    this.selectRect.stroke = '#FF69B4'


    /** Prepare a special group for all the interaction elements.*/
    this.interactionGroup = this.two.makeGroup([this.selectCircle], [this.selectRect])
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
   * Fired when mouse-down event is registered within canvas.
   * Starts dragging state.
   *
   * @param event
   */
  public onMouseDown(event: MouseEvent) {
    this.dragging = true;
  };

  /**
   * Fired when mouse-up event is registered within canvas.
   * Ends dragging state.
   *
   * @param event
   */
  public onMouseUp(event: MouseEvent) {
    this.dragging = false;
  };

  /**
   * Fired when mouse leaves canvas.
   * Ends dragging state.
   *
   * @param event
   */
  public onMouseLeave(event: MouseEvent) {
    this.dragging = false;
  };

  /**
   * Fired when mouse leaves canvas.
   * Ends dragging state.
   *
   * @param event
   */
  public onMouseMove(event: MouseEvent) {
    /* Update mouse position. */
    const radiusScared = 16;
    this.mouse.set(event.clientX - this.canvas.nativeElement.offsetLeft, event.clientY - this.canvas.nativeElement.offsetTop)

    /* Check if mouse is dragging and make respective call. */
    if (this.dragging && this.currentPoint != null) {
      this.onMouseDrag()
      return
    }

    /* Check if mouse is still centered on current anchor. */
    if (this.currentPoint != null) {
      const d = this.mouse.distanceToSquared(this.currentPoint)
      if (d <= radiusScared) {
        return;
      }

      /* Reset current anchor. */
      this.currentPoint = null;
      this.selectCircle.visible = false
    }

    /* Update current anchor. */
    for (let group of this.poses) {
      const allPoints: Array<JointAnchor> = group.children[0].vertices.concat(group.children[1].vertices) /* Concat all points. */
      for(let anchor of allPoints) {
        const d = anchor.distanceToSquared(this.mouse)
        if (d <= radiusScared) {
          this.currentPoint = anchor;
          this.currentPose = group;
          this.selectCircle.visible = true
          this.selectCircle.position.copy(anchor)
          return;
        }
      }
    }
  }
  /**
   *
   * @param event
   */
  public onClick(event: MouseEvent) {




    if (this.currentPose != null) {
      const bounds = PoseSketchDialogComponent.boundingBox(this.currentPose)
      this.selectRect.height = bounds.height
      this.selectRect.width = bounds.width
      this.selectRect.position = this.currentPose.position
      this.selectRect.visible = true
    } else {

    }
  }

  /**
   *
   * @param event
   */
  public onDoubleClick(event: MouseEvent) {
    if (this.currentPoint != null) {
      const active: Array<JointAnchor> = this.currentPose.children[0].vertices
      const inactive: Array<JointAnchor> = this.currentPose.children[1].vertices
      if (active.indexOf(this.currentPoint) > -1) {
        active.splice(active.indexOf(this.currentPoint), 1)
        inactive.push(this.currentPoint)
      } else if (inactive.indexOf(this.currentPoint) > -1) {
        inactive.splice(inactive.indexOf(this.currentPoint), 1)
        active.push(this.currentPoint)
      }
      this.currentPoint.disable = !this.currentPoint.disable
      for (let i = 2; i < this.currentPose.children.length; i++) {
        let path: Path = this.currentPose.children[i]
        if (!path.vertices.every(p => !p.disable)) {
          path.stroke = '#AAAAAA'
        } else {
          path.stroke = '#000000'
        }
      }
    }
  }

  /**
   * Fired when mouse drags a points. This is not actually an event but called by {@link onMouseMove}.
   *
   * One can assume, that this {@link currentPoint} is not null when this method is called.!
   */
  private onMouseDrag() {
    this.currentPoint.set(this.mouse.x, this.mouse.y)
    this.selectCircle.position.set(this.mouse.x, this.mouse.y)
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
    this.poses.splice(0, this.poses.length) /* Clear poses. */

    /* Now draw every pose. */
    for (let pose of this.query.poses) {
      /* Prepare group and anchors. */
      const elements = []

      /* Prepare anchors for active and inactive joints. */
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
      const anchors = []
      for (let joint of joints) {
        const point = new JointAnchor(joint.x * scale, joint.y * scale, 0, 0, 0, 0, Two.Commands.line)
        anchors.push(point)
        if (joint.disable) {
          inactive.vertices.push(point)
        } else {
          active.vertices.push(point)
        }
      }

      /** Add connections. */
      for (let connection of connections) {
        let path = new Two.Path(connection.map(p => anchors[p]), false, false, true)
        path.linewidth = 2
        if (!path.vertices.every(p => !p.disable)) {
          path.stroke = '#AAAAAA'
        } else {
          path.stroke = '#000000'
        }
        elements.push(path)
      }

      /** Add group to canvas. */
      const group = this.two.makeGroup(elements)
      this.poses.push(group)
    }
  }

  /**
   *
   * @private
   */
  private static boundingBox(group: Group): any {
    const allPoints: Array<JointAnchor> = group.children[0].vertices.concat(group.children[1].vertices) /* Concat all points. */
    let maxX = -Infinity
    let maxY = -Infinity
    let minX = Infinity
    let minY = Infinity
    for (let anchor of allPoints) {
      maxX = Math.max(maxX, anchor.x)
      minX = Math.min(minX, anchor.x)
      maxY = Math.max(maxY, anchor.y)
      minY = Math.min(minY, anchor.y)
    }
    return { width: maxX-minX, height: maxY-minY}
  }
}
