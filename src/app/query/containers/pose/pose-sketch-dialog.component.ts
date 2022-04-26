import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Skeleton, PoseQuery} from './pose-query.interface';
import Two from 'two.js';
import {Rectangle} from 'two.js/src/shapes/rectangle';
import {DrawableSkeleton} from './model/drawableSkeleton';
import {DrawableJoint} from './model/drawableJoint';
import {Vector} from 'two.js/src/vector';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-pose-sketchpad',
  templateUrl: 'pose-sketch-dialog.component.html',
  styleUrls: ['pose-sketch-dialog.component.css']
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

  /** The {@link Rectangle} used to indicate the bounding box of a selected {@link DrawableSkeleton}. */
  private selectRect: Rectangle

  /** The {@link Rectangle} used to indicate the bounding box of a highlighted {@link DrawableSkeleton}. */
  private highlightRect: Rectangle

  /** Named presets for  */
  presets: Array<[string, SafeUrl, Skeleton]> = []

  /** The currently selected {@link DrawableSkeleton}. */
  selectedSkeleton: DrawableSkeleton = null

  /** The currently highlighted {@link DrawableSkeleton}. */
  highlightedSkeleton: DrawableSkeleton = null

  /** The currently highlighted {@link DrawableJoint}. */
  highlightedJoint: DrawableJoint = null

  /**
   * Constructor for SketchDialogComponent.
   */
  constructor(private domSanitizer: DomSanitizer, private _dialogRef: MatDialogRef<PoseSketchDialogComponent>, @Inject(MAT_DIALOG_DATA) private _input: Skeleton[]) {
    this._dialogRef.disableClose = true;
  }

  /**
   * Lifecycle Hook (afterViewInit): Sets the default line size and colour.
   */
  public ngAfterViewInit(): void {
    this.two = new Two({
      type: Two.Types.canvas,
      width: 800,
      height: 450,
      overdraw: false,
      autostart: true
    }).appendTo(this.canvas.nativeElement);

    /** Populate menu with presets. */
    this.populatePresets()

    /** Create hightlight rectangle. */
    this.highlightRect = this.two.makeRectangle(0, 0, 0, 0)
    this.highlightRect.visible = false
    this.highlightRect.stroke = '#FF69B4'
    this.highlightRect.dashes = [1, 2]

    /** Create selection rectangle. */
    this.selectRect = this.two.makeRectangle(0, 0, 0, 0)
    this.selectRect.visible = false
    this.selectRect.stroke = '#FF69B4'

    /** Add skeletons to input. */
    for (const pose of this._input) {
      this.addSkeleton(new DrawableSkeleton(pose));
    }
  }

  /**
   * Adds a new {@link Skeleton} to the scene.
   */
  public addNewSkeleton(skeleton: Skeleton = null) {
    if (skeleton == null) skeleton = DrawableSkeleton.DEFAULT
    this.addSkeleton(new DrawableSkeleton(skeleton, Math.min(this.two.width, this.two.height)));
  }

  /**
   * Removes the currently selected {@link DrawableSkeleton} from the scene.
   */
  public removeSelectedSkeleton() {
    if (this.selectedSkeleton != null) {
      this.removeSkeleton(this.selectedSkeleton);
      this.selectedSkeleton = null
      this.selectRect.visible = false
    }
  }

  /**
   * Removes the currently selected {@link DrawableSkeleton} from the scene.
   */
  public copySelectedSkeleton() {
    if (this.selectedSkeleton != null) {
      this.addSkeleton(new DrawableSkeleton(this.selectedSkeleton));
    }
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
   * Fired when mouse moves within canvas.
   *
   * Processes mouse position and makes necessary visual adjustments
   * (e.g., drawing of bounding box, changing of states). Also propagtes
   * to {@link onMouseDrag()} method if state is currentls {@link dragging}.
   *
   * @param event
   */
  public onMouseMove(event: MouseEvent) {
    /* Update mouse position. */
    const radiusSquared = 36;
    const delta = new Two.Vector(event.movementX, event.movementY)
    const mouse = new Two.Vector(event.offsetX, event.offsetY)

    /* Check if mouse is dragging and make respective call. */
    if (this.dragging && (this.highlightedJoint != null || this.highlightedSkeleton != null)) {
      this.onMouseDrag(delta)
      return
    }

    /* Update current anchor. */
    this.highlightedSkeleton = null
    this.highlightRect.visible = false
    for (const drawableSkeleton of this.poses) {
      /* Check collision of mouse with a skeleton group. */
      const bounds = drawableSkeleton.getBoundingClientRect()
      if (mouse.x >= bounds.left && mouse.x <= bounds.right && mouse.y >= bounds.top && mouse.y <= bounds.bottom) {
        this.highlightRect.width = bounds.width + 10;
        this.highlightRect.height = bounds.height + 10;
        this.highlightRect.position.set(bounds.left + (bounds.right - bounds.left) / 2, bounds.top + (bounds.bottom - bounds.top) / 2)
        this.highlightRect.visible = true
        this.highlightedSkeleton = drawableSkeleton
      } else {
        continue; /* No need to check further; we're not even within the bounds of the group. */
      }

      /* Check collision of mouse with individual point. */
      this.highlightedJoint = null
      for (const joint of drawableSkeleton.joints) {
        const d = joint.position.distanceToSquared(mouse)
        if (d <= radiusSquared) {
          this.highlightedJoint = joint;
          joint.hover = true;
          break
        } else {
          joint.hover = false
        }
      }
    }
  }

  /**
   * Processes click event.
   *
   * Selects currently selected {@link DrawableSkeleton} and updates the selection rectangle.
   *
   * @param event
   */
  public onClick(event: MouseEvent) {
    this.selectedSkeleton = this.highlightedSkeleton
    if (this.selectedSkeleton != null) {
      const bounds = this.selectedSkeleton.getBoundingClientRect()
      this.selectRect.width = bounds.width + 10;
      this.selectRect.height = bounds.height + 10;
      this.selectRect.position.set(bounds.left + (bounds.right - bounds.left) / 2, bounds.top + (bounds.bottom - bounds.top) / 2)
      this.selectRect.visible = true
    } else {
      this.selectRect.visible = false
    }
  }

  /**
   * Processes double click event.
   *
   * Double clicks can be used to enable / disable joints
   *
   * @param event
   */
  public onDoubleClick(event: MouseEvent) {
    if (this.highlightedJoint != null) {
      this.highlightedJoint.disable = !this.highlightedJoint.disable
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
   * Changes aspect ratio of canvas to 16:9
   */
  public setAspect169() {
    this.two.width = 800;
    this.two.height = 450;
    this._dialogRef.updateSize('800px', '600px')
  }

  /**
   * Changes aspect ratio of canvas to 4:3
   */
  public setAspect43() {
    this.two.width = 800;
    this.two.height = 600;
    this._dialogRef.updateSize('800px', '750px')
  }

  /**
   * Fired when mouse drags a points. This is not actually an event but called by {@link onMouseMove}.
   *
   * One can assume, that this {@link currentPoint} is not null when this method is called.!
   */
  private onMouseDrag(delta: Vector) {
    if (this.highlightedSkeleton != null) {
      /* Execute drag depending on what has been selected. */
      if (this.highlightedJoint != null) {
        this.highlightedJoint.translation.add(delta.x, delta.y)
      } else {
        for (const joint of this.highlightedSkeleton.joints) {
          joint.translation.add(delta.x, delta.y)
        }
      }

      /* Update bounding box. */
      const bounds = this.highlightedSkeleton.getBoundingClientRect()
      this.highlightRect.width = bounds.width + 10;
      this.highlightRect.height = bounds.height + 10;
      this.highlightRect.position.set(bounds.left + (bounds.right - bounds.left) / 2, bounds.top + (bounds.bottom - bounds.top) / 2)
    }
  }

  /**
   * Adds a new {@link Skeleton} to the canvas.
   *
   * @param drawableSkeleton The {@link Skeleton} to add.
   */
  private addSkeleton(drawableSkeleton: DrawableSkeleton) {
    /** Add group to canvas. */
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

  /**
   *
   * @private
   */
  private populatePresets() {
    let two = new Two({type: Two.Types.svg, width: 50, height: 50, overdraw: false, autostart: false})
    let i = 1;
    for (let p of DrawableSkeleton.PRESETS) {
      const drawableSkeleton = new DrawableSkeleton(p, 50, false)
      drawableSkeleton.position.add(0, 0)
      two.add(drawableSkeleton);
      two.render()
      const xml = new XMLSerializer().serializeToString(two.renderer.domElement);
      const image = `data:image/svg+xml;base64,${btoa(xml)}`
      this.presets.push([`Preset ${i++}`, this.domSanitizer.bypassSecurityTrustUrl(image),  p])
      two.remove(drawableSkeleton)
    }
  }
}
