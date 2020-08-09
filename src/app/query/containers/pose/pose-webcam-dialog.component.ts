import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {WebcamCaptureComponent} from '../../../shared/components/webcam/webcam-capture.component';
import {PoseKeypoints} from '../../../shared/model/pose/pose-keypoints.model';
import {MatDialog} from '@angular/material/dialog';
import {PoseDiscardConfirmComponent} from './pose-discard-confirm.component';
import {SkelSpec} from '../../../shared/components/pose/skel-spec';

export interface PoseDialogData {
  img?: string;
  width?: number;
  height?: number;
  pose?: PoseKeypoints;
  mode?: SkelSpec;
}

@Component({
  moduleId: module.id,
  selector: 'pose-webcam',
  templateUrl: 'pose-webcam-dialog.component.html',
  styleUrls: ['pose-webcam-dialog.component.css']
})
export class PoseWebcamDialogComponent implements OnInit {
  @ViewChild('imageloader')
  private imageloader: any;

  @ViewChild('webcam')
  private _webcam: WebcamCaptureComponent;

  public mode: SkelSpec = null;
  private pose: PoseKeypoints;

  /**
   *
   * @param _dialogRef
   */
  constructor(
    private _dialog: MatDialog,
    private _dialogRef: MatDialogRef<PoseWebcamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: PoseDialogData
  ) {
    _dialogRef.disableClose = true;
  }

  /**
   * Lifecycle Hook (onInit): Loads the injected image data (if specified).
   */
  public ngOnInit(): void {
    if (this._data) {
      if (this._data.mode !== undefined) {
        this.mode = this._data.mode;
      }
      if (this._data.img !== undefined) {
        this._webcam.setImageSkel(this._data.img, this._data.pose);
      }
    }
  }

  public onLoadImage() {
    this.imageloader.nativeElement.click();
  }

  public onFileAvailable(event: any) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this._webcam.setImageSkel(reader.result as string);
      this.imageloader.nativeElement.value = null;
    }, false);
    reader.readAsDataURL(event.target.files[0]);
  };

  /**
   *  Triggered whenever someone clicks the 'Save' button; Closes the dialog.
   */
  public onSaveClicked(force) {
    if (!force && this.pose !== null && this.mode === null) {
      /* Initialize the correct dialog-component. */
      const dialogRef = this._dialog.open(
        PoseDiscardConfirmComponent,
        {
          width: '320px',
          height: '280px'
        }
      );
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.onSaveClicked(true);
        }
      });
      return;
    }
    const data: PoseDialogData = {};
    if (this.mode !== null) {
      data.mode = this.mode;
    }
    const img = this._webcam.getImage();
    if (img !== null) {
      data.img = img;
    }
    data.width = this._webcam.width;
    data.height = this._webcam.height;
    if (this.mode !== null && this.pose !== null) {
      data.pose = this.pose;
    }
    this._dialogRef.close(data);
  }

  updateSkel(pose: PoseKeypoints) {
    this.pose = pose;
  }
}
