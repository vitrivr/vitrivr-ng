import {Component, OnInit, ViewChild, AfterViewInit, Input, EventEmitter, Output} from '@angular/core';
import {PoseService, PoseResult, Pose} from '../../../core/pose/pose.service';
import {PoseKeypoints} from '../../model/pose/pose-keypoints.model';
import {Config} from '../../model/config/config.model';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'webcam-capture',
  templateUrl: './webcam-capture.component.html',
  styleUrls: ['webcam-capture.component.css']
})
export class WebcamCaptureComponent implements AfterViewInit {
  public delayValue = 3;
  public delayRemaining = 0;
  public photoData: string = null;
  public hasPhoto = false;
  public skelData: PoseKeypoints = null;
  public hasSkelResult = false;
  public hasSkel = false;
  public width: number;
  public height: number;
  public discardSkels = 0;
  public noWebcam = true;
  @Input('mode') public mode: string = null
  @Output('skelChange') skelChange: EventEmitter<PoseKeypoints> = new EventEmitter();

  @ViewChild('video') video;
  @ViewChild('img') img;

  constructor(private _poseService: PoseService, private _snackBar: MatSnackBar) {
    this._poseService.observable.subscribe(
      (msg) => this.onPoseResult(msg)
    );
  }

  ngAfterViewInit() {
    // set the initial state of the video
    const video: HTMLVideoElement = this.video.nativeElement;
    this.startRecording();
  }

  successCallback(stream: MediaStream) {
    this.noWebcam = false;
    const video: HTMLVideoElement = this.video.nativeElement;
    video.srcObject = stream;
    const trackSettings = stream.getVideoTracks()[0].getSettings();
    this.width = trackSettings.width;
    this.height = trackSettings.height;
  }

  errorCallback() {
    this._snackBar.open(
      'Could not get access to webcam. Please allow this page permission if you would like to use it.',
      null,
      {duration: Config.SNACKBAR_DURATION, panelClass: 'snackbar-error'}
    );
  }

  startRecording() {
    navigator.mediaDevices
      .getUserMedia({video: true, audio: false})
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }

  decDelay() {
    this.delayRemaining--;
    if (this.delayRemaining === 0) {
      this.takePhoto();
    } else {
      setTimeout(() => this.decDelay(), 1000);
    }
  }

  triggerPhoto() {
    if (this.delayValue === 0) {
      this.takePhoto();
    } else {
      if (this.delayRemaining === 0) {
        setTimeout(() => this.decDelay(), 1000);
      }
      this.delayRemaining = this.delayValue;
    }
  }

  takePhoto() {
    const video: HTMLVideoElement = this.video.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.setPhotoData(canvas.toDataURL('image/png'));
    this.lookupSkel();
  }

  setDimsFromImg() {
    this.width = this.img.nativeElement.naturalWidth;
    this.height = this.img.nativeElement.naturalHeight;
  }

  private setPhotoData(dataUrl: string, doSetDimsFromImg: boolean = false) {
    this.photoData = dataUrl;
    this.hasPhoto = true;
    if (doSetDimsFromImg) {
      const onImgLoad = () => {
        this.setDimsFromImg();
        this.img.nativeElement.removeEventListener('load', onImgLoad);
      }
      this.img.nativeElement.addEventListener('load', onImgLoad);
    }
    this.img.nativeElement.src = this.photoData;
  }

  private lookupSkel() {
    const lookupDone = this._poseService.skelLookup(this.photoData);
    if (!lookupDone) {
      this._snackBar.open(
        'Could not lookup skeleton for pose. Please try again in a moment.',
        null,
        {duration: Config.SNACKBAR_DURATION, panelClass: 'snackbar-error'}
      );
      this.discardPhoto(true);
    }
  }

  private setSkel(skel: PoseKeypoints) {
    console.log('setSkel', skel);
    this.skelData = skel;
    this.hasSkel = true;
    this.skelChange.emit(skel);
  }

  onPoseResult(poseResult: PoseResult) {
    if (this.discardSkels > 0) {
      this.discardSkels--;
      return;
    }
    this.hasSkelResult = true;
    if (poseResult.kind === 'pose') {
      this.setSkel(poseResult.payload);
    }
  }

  discardPhoto(noDiscardSkel = false) {
    if (!noDiscardSkel && this.hasPhoto && !this.hasSkelResult) {
      this.discardSkels++;
    }
    this.hasPhoto = false;
    this.hasSkel = false;
    this.hasSkelResult = false;
    this.photoData = null;
    this.skelData = null;
  }

  getImage() {
    if (!this.hasPhoto) {
      return null;
    }
    return this.photoData;
  }

  getPose() {
    if (!this.hasSkel) {
      return null;
    }
    return this.skelData;
  }

  public setImageSkel(data: string, skel?: PoseKeypoints) {
    this.discardPhoto();
    this.setPhotoData(data, true);
    if (skel) {
      this.hasSkelResult = true;
      this.setSkel(skel);
    } else {
      this.lookupSkel();
    }
  }
}
