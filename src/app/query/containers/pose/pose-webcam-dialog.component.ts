import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {WebcamCaptureComponent} from '../../../shared/components/webcam/webcam-capture.component';
import {PoseKeypoints} from '../../../shared/model/pose/pose-keypoints.model';

export interface PoseDialogData {
  img?: string;
  width?: number;
  height?: number;
  pose?: PoseKeypoints;
  mode?: string;
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

  public mode: string = "BODY_25_HANDS";

  /**
   *
   * @param _dialogRef
   */
  constructor(
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
  public onSaveClicked() {
    const data: PoseDialogData = {mode: this.mode};
    const img = this._webcam.getImage();
    if (img !== null) {
      data.img = img;
    }
    data.width = this._webcam.width;
    data.height = this._webcam.height;
    const pose = this._webcam.getPose()
    if (pose !== null) {
      data.pose = pose;
    }
    this._dialogRef.close(data);
  }
}
