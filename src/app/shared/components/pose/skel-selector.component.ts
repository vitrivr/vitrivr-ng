import {Component, Output, EventEmitter, Input, SimpleChange, OnChanges} from '@angular/core';
import {PoseKeypoints} from '../../model/pose/pose-keypoints.model';
import {SkelSpec} from './skel-spec';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DisplayPose, mkModelPose} from './display-pose';

const WIDTH = 200;
const PADDING = 5;
const SEMANTIC_MODES = ['LEFT_HAND_IN_BODY_25', 'RIGHT_HAND_IN_BODY_25'];

@Component({
  selector: 'skel-selector',
  templateUrl: 'skel-selector.component.html',
  styleUrls: ['skel-selector.component.css']
})
export class SkelSelectorComponent implements OnChanges {
  public modes: SkelSpec[] = SkelSpec.specs();
  public invalidModes: Set<SkelSpec> = new Set();
  public validModes: Set<SkelSpec> = new Set();
  public inputPose: DisplayPose = null;
  public modelPose: DisplayPose = mkModelPose(WIDTH, PADDING);
  @Input('pose') public pose: PoseKeypoints = null;
  @Input('curMode') public curMode: SkelSpec = null;
  @Output('curModeChange') public curModeChange: EventEmitter<SkelSpec> = new EventEmitter();
  public normalOrientation = true;
  public mirrorOrientation = false;
  @Output('orientationsChange') public orientationsChange: EventEmitter<[boolean, boolean]> = new EventEmitter();
  public invalidShown = false;
  @Output('semanticChange') public semanticChange: EventEmitter<boolean> = new EventEmitter();
  public semantic = false;

  constructor(private _snackBar: MatSnackBar) {
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    console.log('ngOnChanges', changes)
    if (changes.hasOwnProperty('pose')) {
      this.updateModeValidities();
      this.preprocPose();
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
      if (mode.hasAll(this.pose.keypoints)) {
        this.validModes.add(mode);
      } else {
        this.invalidModes.add(mode);
      }
    }
    if (this.curMode !== null && !this.validModes.has(this.curMode)) {
      this.curMode = null;
      this.onCurModeChange();
    }
  }

  preprocPose() {
    if (!this.pose) {
      return;
    }
    this.inputPose = new DisplayPose(this.pose.keypoints, WIDTH, PADDING);
  }

  onCurModeChange() {
    this.semantic = this.semanticValid();
    this.semanticChange.emit(this.semantic);
    this.curModeChange.emit(this.curMode);
  }

  onOrientationsChange() {
    this.orientationsChange.emit([
      this.normalOrientation,
      this.mirrorOrientation
    ]);
  }

  semanticValid(): boolean {
    if (this.curMode === null) {
      return false;
    }
    return SEMANTIC_MODES.indexOf(this.curMode.modeName) !== -1;
  }
}
