import {Component, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input, SimpleChange, OnChanges, SimpleChanges, AfterViewChecked, ChangeDetectorRef} from '@angular/core';
import {PoseKeypoints} from '../../model/pose/pose-keypoints.model';
import {SkelSpec} from './skel-spec';
import {MatSnackBar} from '@angular/material/snack-bar';
import {quadtree} from 'd3-quadtree';

@Component({
  selector: 'pose-selector',
  templateUrl: 'pose-selector.component.html',
  styleUrls: ['pose-selector.component.css']
})
export class PoseSelectorComponent implements OnChanges {
  @ViewChild('img') img;

  @Input('photoData') public photoData: string;
  @Input('poses') public poses: PoseKeypoints[];
  @Output('chosenPoseIdxChange') chosenPoseIdxChange: EventEmitter<number> = new EventEmitter();
  body25Hands = SkelSpec.get('BODY_25_HANDS');
  public imageWidth: number;
  public imageHeight: number;
  public unitScale: number;
  private quadtree;
  public hoverIdx = null;
  public chosenIdx = null;

  constructor(
    private _snackBar: MatSnackBar,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes.hasOwnProperty('photoData') && this.photoData !== null) {
      this.onPhotoDataChange();
    }
    if (changes.hasOwnProperty('poses')) {
      this.updateQuadTree();
    }
  }

  onPhotoDataChange() {
    setTimeout(() => {
      if (this.img.nativeElement.loaded) {
        this.updateDims();
      } else {
        this.img.nativeElement.addEventListener('load', () => this.updateDims());
      }
    });
  }

  updateDims() {
    this.imageWidth = this.img.nativeElement.naturalWidth;
    this.imageHeight = this.img.nativeElement.naturalHeight;
    this.unitScale = this.imageHeight / this.img.nativeElement.height;
    this._cd.detectChanges();
    this.updateQuadTree();
  }

  updateQuadTree() {
    if (!this.poses || !this.poses.length) {
      return;
    }
    const data = [];
    for (const [poseIdx, pose] of this.poses.entries()) {
      for (const kp of pose.keypoints) {
        if (kp[2] == 0) {
          continue;
        }
        data.push([kp[0] / this.unitScale, kp[1] / this.unitScale, poseIdx]);
      }
    }
    this.quadtree = quadtree(data);
  }

  skelOfMouseEvent(event) {
    const clientRect = this.img.nativeElement.getBoundingClientRect();
    const x = event.pageX - clientRect.left;
    const y = event.pageY - clientRect.top;
    const result = this.quadtree.find(x, y, 30);
    if (result !== undefined) {
      return result[2];
    }
  }

  onMouseMove(event) {
    const skelIdx = this.skelOfMouseEvent(event)
    this.hoverIdxChange(skelIdx !== undefined ? skelIdx : null);
  }

  onClick(event) {
    const skelIdx = this.skelOfMouseEvent(event)
    if (skelIdx !== undefined) {
      this.chosenIdxChange(skelIdx);
    }
  }

  hoverIdxChange(newChosenIdx) {
    this.hoverIdx = newChosenIdx;
  }

  hoverOut() {
    this.hoverIdx = null;
  }

  chosenIdxChange(newChosenIdx) {
    if (newChosenIdx !== this.chosenIdx) {
      this.chosenIdx = newChosenIdx;
      this.chosenPoseIdxChange.emit(newChosenIdx);
    }
  }

  activeIdx() {
    return this.hoverIdx !== null ? this.hoverIdx : this.chosenIdx;
  }
}
