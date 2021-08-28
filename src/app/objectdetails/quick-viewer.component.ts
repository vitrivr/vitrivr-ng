import {AfterViewInit, Component, Inject, NgZone, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MediaObjectScoreContainer} from '../shared/model/results/scores/media-object-score-container.model';
import {MediaSegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';
import {ResolverService} from '../core/basics/resolver.service';
import {VbsSubmissionService} from '../core/vbs/vbs-submission.service';
import * as openseadragon from 'openseadragon';

@Component({

  selector: 'app-quick-viewer',
  templateUrl: 'quick-viewer.component.html',
  styleUrls: ['quick-viewer.component.css']
})
export class QuickViewerComponent implements AfterViewInit {

  /** Reference to the audio player. */
  @ViewChild('audioplayer')
  private audioplayer: any;

  /** Reference to the video player. */
  @ViewChild('videoplayer')
  private videoplayer: any;

  /** Reference to the img tag for preview. */
  @ViewChild('imageviewer')
  private imageviewer: any;

  /**
   *
   * @param data The MediaObjectScoreContainer or SegmentScoreContainer that should be displayed.
   * @param _resolver ResolverService reference that is being injected.
   * @param _vbs VbsSubmissionService reference that is being injected.
   */
  public constructor(@Inject(MAT_DIALOG_DATA) data: any, readonly _resolver: ResolverService, readonly _vbs: VbsSubmissionService, private _ngZone: NgZone) {
    if (data instanceof MediaObjectScoreContainer) {
      this._segment = data.representativeSegment;
    } else if (data instanceof MediaSegmentScoreContainer) {
      this._segment = data;
    } else {
      throw new Error('You must either provide a MediaObjectScoreContainer or a SegmentScoreContainer to an instance von QuickViewerComponent!');
    }
  }

  /** SegmentScoreContainer that is currently in focus. */
  public _segment: MediaSegmentScoreContainer;

  /**
   * Getter for SegmentScoreContainer.
   *
   * @return {MediaSegmentScoreContainer}
   */
  get segment(): MediaSegmentScoreContainer {
    return this._segment;
  }

  /**
   * Getter for SegmentScoreContainer.
   *
   * @return {MediaSegmentScoreContainer}
   */
  get mediaobject(): MediaObjectScoreContainer {
    return this._segment.objectScoreContainer;
  }

  /**
   * Returns the URL of the IIIF Image API resource's info.json file
   */
  get iiifResourceUrl(): string {
    return this._resolver.iiifUrlToObject(this.mediaobject, true);
  }

  /**
   * Initialize the openseadragon viewer to load the IIIF Image API resource if applicable
   */
  ngAfterViewInit(): void {
    let url = this.iiifResourceUrl
    if (!url) {
      return null
    } else {
      url = url + 'info.json';
    }
    this._ngZone.runOutsideAngular(() => openseadragon({
        id: 'openseadragon',
        preserveViewport: true,
        showNavigator: true,
        visibilityRatio: 1,
        // Initial rotation angle
        degrees: parseFloat(this.mediaobject.metadata.get('IIIF.rotation')) || 0,
        // Show rotation buttons
        showRotationControl: true,
        minZoomLevel: 1,
        defaultZoomLevel: 1,
        prefixUrl: '/assets/images/openseadragon/',
        tileSources: [url]
      })
    );
  }

  /**
   * Submits the current image to the VBS/LSC endpoint.
   */
  public onSubmitPressed() {
    this._vbs.submitSegment(this.segment);
  }
}
