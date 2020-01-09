import {Component, Input, ViewChild} from '@angular/core';
import {MotionQueryTerm} from '../../../shared/model/queries/motion-query-term.model';
import {MotionSketchDialogComponent} from './motion-sketch-dialog.component';
import {MatDialog} from '@angular/material';
import {MotionData} from './model/motion-data.model';
import {first} from 'rxjs/operators';

@Component({
  selector: 'qt-motion',
  templateUrl: 'motion-query-term.component.html',
  styleUrls: ['motion-query-term.component.css']
})
export class MotionQueryTermComponent {
  /** The MotionQueryTerm object associated with this MotionQueryTermComponent. That object holds all the query-settings. */
  @Input()
  private motionTerm: MotionQueryTerm;

  /** Component used to display a preview of the selected AND/OR sketched image. */
  @ViewChild('previewimg')
  private previewimg: any;

  /**
   * Default constructor.
   *
   * @param _dialog
   */
  constructor(private _dialog: MatDialog) {
  }

  /**
   * Triggered whenever someone click on the image, which indicates that it should
   * be edited; opens the MotionSketchDialogComponent
   */
  public onViewerClicked() {
    /* Initialize the correct dialog-component. */
    let dialogRef = this._dialog.open(MotionSketchDialogComponent, {height: '450px'});
    dialogRef.afterClosed().pipe(first()).subscribe((result: [string, MotionData]) => {
      if (result) {
        this.previewimg.nativeElement.src = result[0];
        this.motionTerm.data = 'data:application/json;base64,' + btoa(JSON.stringify(result[1]));
      }
    });
  }
}
