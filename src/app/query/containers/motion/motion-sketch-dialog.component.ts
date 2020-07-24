import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {TrackingSketchCanvasComponent} from '../../../shared/components/sketch/tracking-sketch-canvas.component';
import {MotionData} from './model/motion-data.model';
import {MotionArrowFactory} from './model/motion-arrow-factory.model';
import {MotionArrow} from './model/motion-arrow.model';
import {MotionPath} from './model/motion-path.model';
import {Point} from '../../../shared/components/sketch/model/point.model';

@Component({

  selector: 'motion-sketchpad',
  templateUrl: 'motion-sketch-dialog.component.html',
})
export class MotionSketchDialogComponent implements AfterViewInit {
  /** Sketch-canvas component. */
  @ViewChild('sketch')
  private _sketchpad: TrackingSketchCanvasComponent;

  /** The factory for the drawable items. */
  private _factory: MotionArrowFactory = new MotionArrowFactory();

  /**
   *
   * @param _dialogRef
   */
  constructor(private _dialogRef: MatDialogRef<MotionSketchDialogComponent>) {
    this.onToggleFrontClicked();
  }

  /**
   * Getter for the currently active MotionType.
   *
   * @return {MotionType}
   */
  public get type() {
    return this._factory.type;
  }

  /**
   * Lifecycle Hook (afterViewInit): Sets the default linesize and colour.
   */
  public ngAfterViewInit(): void {
    this._sketchpad.factory = this._factory;
  }

  /**
   * Triggered whenever someone clicks the 'Clear canvas' button.
   */
  public onClearCanvasClicked() {
    this._sketchpad.clear();
  }

  /**
   * Triggered whenever someone clicks the 'Foreground motion' button.
   */
  public onToggleFrontClicked() {
    this._factory.type = 'FOREGROUND';
  }

  /**
   * Triggered whenever someone clicks the 'Background motion' button.
   */
  public onToggleBackClicked() {
    this._factory.type = 'BACKGROUND';
  }

  /**
   *  Triggered whenever someone clicks the 'Save' button; Closes the dialog.
   */
  public onSaveClicked() {
    let motion = <MotionData>{foreground: [], background: []};
    for (let drawable of this._sketchpad.drawables) {
      if (drawable instanceof MotionArrow) {
        let normalised: Point[] = [];
        for (let p of drawable.points) {
          normalised.push(new Point(p.x / this._sketchpad.width, p.y / this._sketchpad.height))
        }
        if (drawable.type == 'FOREGROUND') {
          motion.foreground.push(<MotionPath>{path: normalised, type: 'FOREGROUND'});
        } else if (drawable.type == 'BACKGROUND') {
          motion.background.push(<MotionPath>{path: normalised, type: 'BACKGROUND'});
        }
      }
    }
    this._dialogRef.close([this._sketchpad.getImageBase64(), motion]);
  }
}
