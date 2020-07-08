import {Component, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {MediaObjectScoreContainer} from '../shared/model/results/scores/media-object-score-container.model';
import {SegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';
import {ResolverService} from '../core/basics/resolver.service';
import {VbsSubmissionService} from '../core/vbs/vbs-submission.service';

@Component({
  moduleId: module.id,
  selector: 'quick-viewer',
  templateUrl: 'quick-viewer.component.html',
  styleUrls: ['quick-viewer.component.css']
})
export class QuickViewerComponent {

  /** Reference to the audio player. */
  @ViewChild('audioplayer')
  private audioplayer: any;

  /** Reference to the video player. */
  @ViewChild('videoplayer')
  private videoplayer: any;

  /** Reference to the img tag for preview. */
  @ViewChild('imageviewer')
  private imageviewer: any;

  /** SegmentScoreContainer that is currently in focus. */
  public _segment: SegmentScoreContainer;

  /**
   *
   * @param data The MediaObjectScoreContainer or SegmentScoreContainer that should be displayed.
   * @param _resolver ResolverService reference that is being injected.
   * @param _vbs VbsSubmissionService reference that is being injected.
   */
  public constructor(@Inject(MAT_DIALOG_DATA) data: any, readonly _resolver: ResolverService, readonly _vbs: VbsSubmissionService) {
    if (data instanceof MediaObjectScoreContainer) {
      this._segment = data.representativeSegment;
    } else if (data instanceof SegmentScoreContainer) {
      this._segment = data;
    } else {
      throw new Error('You must either provide a MediaObjectScoreContainer or a SegmentScoreContainer to an instance von QuickViewerComponent!');
    }
  }

  /**
   * Getter for SegmentScoreContainer.
   *
   * @return {SegmentScoreContainer}
   */
  get segment(): SegmentScoreContainer {
    return this._segment;
  }

  /**
   * Getter for SegmentScoreContainer.
   *
   * @return {SegmentScoreContainer}
   */
  get mediaobject(): MediaObjectScoreContainer {
    return this._segment.objectScoreContainer;
  }

  /**
   * Submits the current image to the VBS/LSC endpoint.
   */
  public onSubmitPressed() {
    this._vbs.submitSegment(this.segment);
  }
}
