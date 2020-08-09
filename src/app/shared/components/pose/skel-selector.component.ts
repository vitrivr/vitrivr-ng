import {Component, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input, SimpleChange, OnChanges} from '@angular/core';
import {PoseKeypoints} from '../../model/pose/pose-keypoints.model';
import {SkelSpec} from './skel-spec';
import modelPose from './pose.json';
import {Pose, PoseService} from '../../../core/pose/pose.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Config} from '../../model/config/config.model';

function preprocModelPose(modelPose, targetWidth, padding): [number, [number, number, number][]] {
  const pose: [number, number][] = modelPose['pose_keypoints_2d'];
  const lhand: [number, number][] = modelPose['hand_left_keypoints_2d'];
  const rhand: [number, number][] = modelPose['hand_right_keypoints_2d'];
  const origPoints = [
    ...pose,
    ...lhand.slice(1),
    ...rhand.slice(1)
  ];
  const xs = origPoints.map((arr) => arr[0]);
  const ys = origPoints.map((arr) => arr[1]);
  const miX = Math.min(...xs) - padding;
  const mxX = Math.max(...xs) + padding;
  const rngX = mxX - miX;
  const miY = Math.min(...ys) - padding;
  const mxY = Math.max(...ys) + padding;
  const rngY = mxY - miY;
  const targetHeight = targetWidth * rngY / rngX;
  return [
    targetHeight,
    origPoints.map(
      (arr) => [(arr[0] - miX) / rngX * targetWidth, (arr[1] - miY) / rngY * targetHeight, 1] as [number, number, number]
    )
  ];
}

const width = 260;
const padding = 40;
const [height, keypoints] = preprocModelPose(modelPose, width, padding);

@Component({
  selector: 'skel-selector',
  templateUrl: 'skel-selector.component.html',
  styleUrls: ['skel-selector.component.css']
})
export class SkelSelectorComponent implements OnChanges {
  public width = width;
  public height = height;
  public keypoints: PoseKeypoints = {keypoints};
  public modes: SkelSpec[] = SkelSpec.specs();
  public validModes: Set<SkelSpec> = new Set();
  @Input('pose') public pose: PoseKeypoints = null;
  @Input('curMode') public curMode: SkelSpec = null;
  @Output('curModeChange') public curModeChange: EventEmitter<SkelSpec> = new EventEmitter();

  constructor(private _snackBar: MatSnackBar) {}

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    console.log('ngOnChanges', changes)
    if (changes.hasOwnProperty('pose')) {
      this.updateModeValidities();
    }
  }

  updateModeValidities() {
    console.log('updateModeValidities');
    this.validModes.clear();
    if (!this.pose) {
      console.log('!this.pose');
      return
    }
    console.log('pose', this.pose);
    for (const mode of this.modes) {
      console.log('mode', mode);
      if (!mode.hasAll(this.pose.keypoints)) {
        console.log('!mode.hasAll(this.pose)');
        continue;
      }
      this.validModes.add(mode);
    }
    if (this.curMode !== null && this.validModes.has(this.curMode)) {
      this.curMode = null;
      this.onCurModeChange();
    }
  }

  onCurModeChange() {
    this.curModeChange.emit(this.curMode);
  }

  cannotSelect(mode: SkelSpec) {
    if (this.validModes.has(mode)) {
      return;
    }
    this._snackBar.open(
      'Cannot use this pose specification/model with current pose since it is missing required keypoints',
      null,
      {duration: Config.SNACKBAR_DURATION, panelClass: 'snackbar-error'}
    );
  }
}
