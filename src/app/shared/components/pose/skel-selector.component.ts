import {Component, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input} from '@angular/core';
import skels from './skels.json';
import modelPose from './pose.json';
import {PoseKeypoints} from '../../model/pose/pose-keypoints.model';

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
export class SkelSelectorComponent {
  public width = width;
  public height = height;
  public keypoints: PoseKeypoints = {keypoints};
  public modes: string[] = [];
  @Input('curMode') public curMode = 'BODY_25_HANDS';
  @Output('curModeChange') public curModeChange = new EventEmitter();

  constructor() {
    for (const mode of Object.keys(skels)) {
      // HAND is a TODO
      if (mode.startsWith('__') || mode === 'HAND') {
        continue;
      }
      this.modes.push(mode);
    }
  }

  onCurModeChange($event) {
    this.curModeChange.emit(this.curMode);
  }
}
