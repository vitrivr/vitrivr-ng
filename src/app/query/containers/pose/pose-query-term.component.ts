import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {SkeletonPoseQueryTerm} from '../../../shared/model/queries/skeleton-pose-query-term.model';
import {first} from 'rxjs/operators';
import {PoseQuery} from './pose-query.interface';
import {MatDialog} from '@angular/material/dialog';
import {ResolverService} from '../../../core/basics/resolver.service';
import {HttpClient} from '@angular/common/http';
import {PoseSketchDialogComponent} from './pose-sketch-dialog.component';

@Component({
  selector: 'app-qt-pose',
  templateUrl: './pose-query-term.component.html',
  styleUrls: ['pose-query-term.component.scss']
})
export class PoseQueryTermComponent implements OnInit {

  /** Component used to display a preview of the pose query. */
  @ViewChild('previewimg', {static: true})
  private previewimg: any;

  /** The {@link SkeletonPoseQueryTerm} object associated with this {@link PoseQueryTermComponent}. That object holds all the query-settings. */
  @Input()
  private poseTerm: SkeletonPoseQueryTerm;

  /** The {@link PoseQuery} object associated with this {@link PoseQueryTermComponent}. */
  @Input()
  private poseQuery: PoseQuery;


  constructor(private _dialog: MatDialog, private _resolver: ResolverService, private _http: HttpClient) {
  }

  ngOnInit(): void {

  }

  /**
   * Triggered whenever someone click on the image, which indicates that
   * it should be edited; opens the SketchDialogComponent
   */
  public onViewerClicked() {
    this.openSketchDialog();
  }

  /**
   * Opens the {@link PoseSketchDialogComponent} and registers a callback that loads the saved result
   * of the dialog into preview image canvas.
   *
   * @param data Optional data that should be handed to the component.
   */
  private openSketchDialog(data?: PoseQuery) {
    /* Initialize the correct dialog-component. */
    const dialogRef = this._dialog.open(PoseSketchDialogComponent, {data: this.poseQuery != null ? this.poseQuery.poses : [], width: '750px', height: '690px'});
    dialogRef.afterClosed().pipe(first()).subscribe(result => this.applyPoseData(result));
  }

  /**
   * Redraws the preview image.
   */
  private applyPoseData(query: PoseQuery) {
    this.poseQuery = query
    this.previewimg.nativeElement.src = query.image
    const skeletons = []
    for (const pose of query.poses) {
      const skeleton = {
        coordinates: [
          pose.nose.x, pose.nose.y,
          pose.left_eye.x, pose.left_eye.y,
          pose.right_eye.x, pose.right_eye.y,
          pose.left_ear.x, pose.left_ear.y,
          pose.right_ear.x, pose.right_ear.y,
          pose.left_shoulder.x, pose.left_shoulder.y,
          pose.right_shoulder.x, pose.right_shoulder.y,
          pose.left_elbow.x, pose.left_elbow.y,
          pose.right_elbow.x, pose.right_elbow.y,
          pose.left_wrist.x, pose.left_wrist.y,
          pose.right_wrist.x, pose.right_wrist.y,
          pose.left_hip.x, pose.left_hip.y,
          pose.right_hip.x, pose.right_hip.y,
          pose.left_knee.x, pose.left_knee.y,
          pose.right_knee.x, pose.right_knee.y,
          pose.left_ankle.x, pose.left_ankle.y,
          pose.right_ankle.x, pose.right_ankle.y,
        ],
        weights: [
          pose.nose.disable ? 0.0 : 1.0,
          pose.left_eye.disable ? 0.0 : 1.0,
          pose.right_eye.disable ? 0.0 : 1.0,
          pose.left_ear.disable ? 0.0 : 1.0,
          pose.right_ear.disable ? 0.0 : 1.0,
          pose.left_shoulder.disable ? 0.0 : 1.0,
          pose.right_shoulder.disable ? 0.0 : 1.0,
          pose.left_elbow.disable ? 0.0 : 1.0,
          pose.right_elbow.disable ? 0.0 : 1.0,
          pose.left_wrist.disable ? 0.0 : 1.0,
          pose.right_wrist.disable ? 0.0 : 1.0,
          pose.left_hip.disable ? 0.0 : 1.0,
          pose.right_hip.disable ? 0.0 : 1.0,
          pose.left_knee.disable ? 0.0 : 1.0,
          pose.right_knee.disable ? 0.0 : 1.0,
          pose.left_ankle.disable ? 0.0 : 1.0,
          pose.right_ankle.disable ? 0.0 : 1.0
        ]
      }
      skeletons.push(skeleton)
    }
    this.poseTerm.data = 'data:application/json;base64,' + btoa(JSON.stringify(skeletons))
  }
}
