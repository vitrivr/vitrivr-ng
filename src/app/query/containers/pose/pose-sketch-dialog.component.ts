import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Skeleton, PoseQuery} from './pose-query.interface';
import Two from 'two.js';
import {Group} from 'two.js/src/group';
import {Rectangle} from 'two.js/src/shapes/rectangle';
import {Anchor} from 'two.js/src/anchor';
import {DrawableSkeleton} from './model/drawableSkeleton';
import {DrawableJoint} from './model/drawableJoint';
import {Vector} from 'two.js/src/vector';



@Component({
  selector: 'app-pose-sketchpad',
  templateUrl: 'pose-sketch-dialog.component.html',
  styleUrls: ['pose-sketch-dialog.component.scss']
})
export class PoseSketchDialogComponent implements AfterViewInit {

  /** Hidden input for image upload. */
  @ViewChild('canvas', {static: true})
  private canvas: ElementRef;

  /** The {@link Two} object used for drawing. */
  private two: Two

  /** List of all {@link Group}s that correspond to a {@link Skeleton}. */
  private poses: Array<DrawableSkeleton> = []

  /** Flag indicating, that cursor is currently dragging. */
  private dragging = false

  /** The {@link Rectangle} used to indicate the bounding box of a {@link Skeleton}. */
  private selectRect: Rectangle

  /** The currently selected {@link Group} that stands for a {@link Skeleton}. */
  private currentSkeleton: DrawableSkeleton = null

  /** The currently selected {@link Anchor} within a {@link Group}. */
  private currentJoint: DrawableJoint = null

  /**
   * Constructor for SketchDialogComponent.
   */
  constructor(private _dialogRef: MatDialogRef<PoseSketchDialogComponent>, @Inject(MAT_DIALOG_DATA) private _input: Skeleton[]) {
    this._dialogRef.disableClose = true;
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

    /** Create selection rectangle. */
    this.selectRect = this.two.makeRectangle(0, 0, 0, 0)
    this.selectRect.visible = false
    this.selectRect.stroke = '#FF69B4'

    /** Add skeletons to input. */
    for (const pose of this._input) {
      this.addSkeleton(pose);
    }
  }

  /**
   * Adds a new {@link Skeleton} to this {@link PoseQuery}.
   */
  public newPose() {
    this.addSkeleton(new DrawableSkeleton(DrawableSkeleton.DEFAULT, Math.min(this.two.width, this.two.height)));
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
    const delta = new Two.Vector(event.movementX, event.movementY)
    const mouse = new Two.Vector(event.offsetX, event.offsetY)

    /* Check if mouse is dragging and make respective call. */
    if (this.dragging && (this.currentJoint != null || this.currentSkeleton != null)) {
      this.onMouseDrag(delta)
      return
    }

    /* Update current anchor. */
    this.currentSkeleton = null
    this.selectRect.visible = false
    for (const drawableSkeleton of this.poses) {
      /* Check collision of mouse with a skeleton group. */
      const bounds = drawableSkeleton.getBoundingClientRect()
      if (mouse.x >= bounds.left && mouse.x <= bounds.right && mouse.y >= bounds.top && mouse.y <= bounds.bottom) {
        this.selectRect.width = bounds.width + 10;
        this.selectRect.height = bounds.height + 10;
        this.selectRect.position.set(bounds.left + (bounds.right - bounds.left) / 2, bounds.top + (bounds.bottom - bounds.top) / 2)
        this.selectRect.visible = true
        this.currentSkeleton = drawableSkeleton
      } else {
        continue; /* No need to check further; we're not even within the bounds of the group. */
      }

      /* Check collision of mouse with individual point. */
      this.currentJoint = null
      for (const joint of drawableSkeleton.joints) {
        const d = joint.position.distanceToSquared(mouse)
        if (d <= radiusScared) {
          this.currentJoint = joint;
          joint.hover = true;
          break
        } else {
          joint.hover = false
        }
      }
    }
  }

  /**
   *
   * @param event
   */
  public onClick(event: MouseEvent) {

  }

  /**
   *
   * @param event
   */
  public onDoubleClick(event: MouseEvent) {
    if (this.currentJoint != null) {
      this.currentJoint.disable = !this.currentJoint.disable
    } else if (this.currentSkeleton != null) {
      this.removeSkeleton(this.currentSkeleton)
    }
  }

  /**
   * Closes the dialog.
   */
  public close() {
    this._dialogRef.close(<PoseQuery>{
      poses: this.poses,
      image: this.two.renderer.ctx.canvas.toDataURL('image/png')
    });
  }

  /**
   * Fired when mouse drags a points. This is not actually an event but called by {@link onMouseMove}.
   *
   * One can assume, that this {@link currentPoint} is not null when this method is called.!
   */
  private onMouseDrag(delta: Vector) {
    if (this.currentSkeleton != null) {
      /* Execute drag depending on what has been selected. */
      if (this.currentJoint != null) {
        this.currentJoint.translation.add(delta.x, delta.y)
      } else {
        for (const joint of this.currentSkeleton.joints) {
          joint.translation.add(delta.x, delta.y)
        }
      }

      /* Update bounding box. */
      const bounds = this.currentSkeleton.getBoundingClientRect()
      this.selectRect.width = bounds.width + 10;
      this.selectRect.height = bounds.height + 10;
      this.selectRect.position.set(bounds.left + (bounds.right - bounds.left) / 2, bounds.top + (bounds.bottom - bounds.top) / 2)
    }
  }

  /**
   * Adds a new {@link Skeleton} to the canvas.
   *
   * @param skeleton The {@link Skeleton} to add.
   */
  private addSkeleton(skeleton: Skeleton) {
    /** Add group to canvas. */
    const drawableSkeleton = new DrawableSkeleton(skeleton)
    this.poses.push(drawableSkeleton)

    /** Add skeleton to scene*/
    this.two.add(drawableSkeleton)
  }

  /**
   * Removes a {@link DrawableSkeleton} from to the canvas.
   *
   * @param drawableSkeleton The {@link DrawableSkeleton} to remove.
   */
  private removeSkeleton(drawableSkeleton: DrawableSkeleton) {
    const index = this.poses.indexOf(drawableSkeleton)
    if (index > -1) {
      this.poses.splice(index, 1)
      this.two.remove(drawableSkeleton)
    }

  }
}
