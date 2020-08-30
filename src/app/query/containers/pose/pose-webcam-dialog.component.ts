import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {WebcamCaptureComponent} from '../../../shared/components/webcam/webcam-capture.component';
import {PoseKeypoints} from '../../../shared/model/pose/pose-keypoints.model';
import {MatDialog} from '@angular/material/dialog';
import {PoseDiscardConfirmComponent} from './pose-discard-confirm.component';
import {SkelSpec} from '../../../shared/components/pose/skel-spec';
import {PoseService, PoseResult} from '../../../core/pose/pose.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Config} from '../../../shared/model/config/config.model';
import {MatStepper} from '@angular/material/stepper';

export interface PoseDialogData {
  img?: string;
  width?: number;
  height?: number;
  poses?: PoseKeypoints[];
  poseIdx?: number;
  mode?: SkelSpec;
  orientations?: [boolean, boolean];
  semantic?: boolean;
}

const INCOMPLETE_ERROR_MSG = `
You have captured poses from an image, but have not selected a pose model
and therefore have not specified a valid pose query.`

const NO_ORIENTATION_ERROR_MSG = `
You have not specified any orientation and therefore have not specified a valid pose query.`

@Component({
  moduleId: module.id,
  selector: 'pose-webcam',
  templateUrl: 'pose-webcam-dialog.component.html',
  styleUrls: ['pose-webcam-dialog.component.css']
})
export class PoseWebcamDialogComponent implements OnInit, OnDestroy {
  @ViewChild('imageloader')
  private imageloader: any;

  @ViewChild('webcam')
  private _webcam: WebcamCaptureComponent;

  @ViewChild('stepper')
  private _stepper: MatStepper;

  private destroyed = false;
  mode: SkelSpec = null;
  photoData: string = null;
  hasSkel: boolean = false;
  hasSkelResult: boolean = false;
  discardSkels = 0;
  poses: PoseKeypoints[];
  poseIdx: number = null;
  orientations: [boolean, boolean] = [true, false];
  semantic: boolean = false;

  /**
   *
   * @param _dialogRef
   */
  constructor(
    private _cd: ChangeDetectorRef,
    private _dialog: MatDialog,
    private _poseService: PoseService,
    private _dialogRef: MatDialogRef<PoseWebcamDialogComponent>,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private _data: PoseDialogData
  ) {
    _dialogRef.disableClose = true;
    this._poseService.observable.subscribe((evt) => this.onPoseResult(evt));
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  /**
   * Lifecycle Hook (onInit): Loads the injected image data (if specified).
   */
  public ngOnInit(): void {
    if (this._data) {
      if (this._data.img !== undefined) {
        this._webcam.setImage(this._data.img);
      }
      if (this._data.mode !== undefined) {
        this.mode = this._data.mode;
      }
    }
  }

  public onLoadImage() {
    this.imageloader.nativeElement.click();
  }

  public onFileAvailable(event: any) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this._webcam.setImage(reader.result as string);
      this.imageloader.nativeElement.value = null;
    }, false);
    reader.readAsDataURL(event.target.files[0]);
  };

  private confirmClose(message: string) {
    const dialogRef = this._dialog.open(
      PoseDiscardConfirmComponent,
      {
        width: '320px',
        height: '280px',
        data: {
          message: message
        }
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._dialogRef.close({});
      }
    });
  }

  /**
   *  Triggered whenever someone clicks the 'Save' button; Closes the dialog.
   */
  public onSaveClicked() {
    if (!this.orientations[0] && !this.orientations[1]) {
      this.confirmClose(NO_ORIENTATION_ERROR_MSG);
      return;
    }
    if (this.poses !== null && (this.poseIdx === null || this.mode === null)) {
      /* Initialize the correct dialog-component. */
      this.confirmClose(INCOMPLETE_ERROR_MSG);
      return;
    }
    const data: PoseDialogData = {};
    const img = this._webcam.getImage();
    if (img !== null) {
      data.img = img;
    }
    data.width = this._webcam.width;
    data.height = this._webcam.height;
    data.poses = this.poses;
    data.poseIdx = this.poseIdx;
    data.mode = this.mode;
    data.orientations = this.orientations;
    data.semantic = this.semantic;
    this._dialogRef.close(data);
  }

  onPoseResult(poseResult: PoseResult) {
    if (this.destroyed) {
      return;
    }
    if (this.discardSkels > 0) {
      this.discardSkels--;
      return;
    }
    this.hasSkelResult = true;
    if (poseResult.kind === 'pose') {
      this.setSkels(poseResult.payload);
    }
  }

  discardPhotoSkel() {
    if (this.photoData !== null && !this.hasSkelResult) {
      this.discardSkels++;
    }
    this.photoData = null;
    this.poseIdx = null;
  }

  gotPhoto(photoData: string) {
    this.photoData = photoData;
    this.lookupSkel();
  }

  setSkels(poses: PoseKeypoints[]) {
    this.poses = poses;
    this.hasSkel = true;
    this._cd.detectChanges();
    this._stepper.next();
  }

  /*
  updateSkels(poses: PoseKeypoints[]) {
    this.poses = poses;
    if (this.poses !== null && this.poseIdx !== null && this.poseIdx < this.poses.length) {
      this.pose = this.poses[this.poseIdx];
    } else {
      this.pose = null;
    }
  }
  */

  private lookupSkel() {
    const lookupDone = this._poseService.skelLookup(this.photoData);
    if (!lookupDone) {
      this._snackBar.open(
        'Could not lookup skeleton for pose. Please try again in a moment.',
        null,
        {duration: Config.SNACKBAR_DURATION, panelClass: 'snackbar-error'}
      );
    }
  }

  chosenIdxChange(chosenIdx: number) {
    this.poseIdx = chosenIdx;
  }

  curPose(): PoseKeypoints {
    if (this.poses && this.poses.length && this.poseIdx !== null) {
      return this.poses[this.poseIdx];
    }
    return null;
  }

  onOrientationsChange(orientations: [boolean, boolean]) {
    this.orientations = orientations;
  }

  onSemanticChange(semantic: boolean) {
    this.semantic = semantic;
  }
}
