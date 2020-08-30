import {Component, OnInit, ViewChild, AfterViewInit, Input, EventEmitter, Output} from '@angular/core';
import {PoseService, PoseResult, Pose} from '../../../core/pose/pose.service';
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
  public width: number;
  public height: number;
  public noWebcam = true;

  @ViewChild('video') video;
  @ViewChild('img') img;
  @Input('hasSkel') hasSkel = false;
  @Input('hasSkelResult') hasSkelResult = false;
  @Output('discardPhotoSkel') discardPhotoSkel = new EventEmitter<null>();
  @Output('gotPhoto') gotPhoto = new EventEmitter<string>();

  constructor(private _poseService: PoseService, private _snackBar: MatSnackBar) {}

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
    this.gotPhoto.emit(this.photoData);
  }

  discardPhoto(noDiscardSkel = false) {
    this.hasPhoto = false;
    this.discardPhotoSkel.emit();
  }

  getImage() {
    if (!this.hasPhoto) {
      return null;
    }
    return this.photoData;
  }

  public setImage(data: string) {
    this.setPhotoData(data, true);
  }
}
