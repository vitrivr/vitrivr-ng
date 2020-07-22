import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {PoseQueryTerm} from '../../../shared/model/queries/pose-query-term.model';
import {PoseDialogData, PoseWebcamDialogComponent} from '../pose/pose-webcam-dialog.component';
import {first} from 'rxjs/operators';

@Component({
  selector: 'qt-pose',
  templateUrl: 'pose-query-term.component.html',
  styleUrls: ['pose-query-term.component.css']
})
export class PoseQueryTermComponent implements OnInit {

  /** The PoseQueryTerm object associated with this PoseQueryTermComponent. That object holds all the query settings. */
  @Input()
  private poseTerm: PoseQueryTerm;

  /** Component used to display a preview of the pose model . */
  @ViewChild('previewpose')
  public poseDialogData: PoseDialogData = {};

  constructor(private _dialog: MatDialog, private _snackBar: MatSnackBar) {
  }

  /**
   * Triggered whenever someone click on the image, which indicates that it should
   * be edited; opens the PoseWebcamDialogComponent
   */
  public onViewerClicked() {
    /* Initialize the correct dialog-component. */
    const config = {
      width: '750px',
      height: '690px',
      data: this.poseDialogData
    };
    const dialogRef = this._dialog.open(PoseWebcamDialogComponent, config);
    dialogRef.afterClosed().pipe(first()).subscribe((result: PoseDialogData) => {
      if (!result) {
        this.poseDialogData = {};
        return;
      }
      this.poseDialogData = result;
      if (result.pose !== null) {
        this.poseTerm.data = 'data:application/json;base64,' + btoa(JSON.stringify({
          pose: result.pose,
          mode: result.mode
        }));
      }
    });
  }

  ngOnInit(): void {
    if (this.poseTerm.data) {
      this._snackBar.open(`Transferring poses between stages is currently not supported`, '', {
        duration: 5000,
      });
    }
  }
}
