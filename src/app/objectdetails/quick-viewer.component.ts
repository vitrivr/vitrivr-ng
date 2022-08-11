import {AfterContentInit, AfterViewInit, Component, Inject, NgZone, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MediaObjectScoreContainer} from '../shared/model/results/scores/media-object-score-container.model';
import {MediaSegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';
import {ResolverService} from '../core/basics/resolver.service';
import {VbsSubmissionService} from '../core/competition/vbs-submission.service';
import * as openseadragon from 'openseadragon';
import {Config} from '../shared/model/config/config.model';
import {AppConfig} from '../app.config';

@Component({

  selector: 'app-quick-viewer',
  templateUrl: 'quick-viewer.component.html',
  styleUrls: ['quick-viewer.component.css']
})
export class QuickViewerComponent implements AfterViewInit, AfterContentInit {

  _config: Config;

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
  public _segment: MediaSegmentScoreContainer;

  public mediaobject: MediaObjectScoreContainer;

  showMd = ((c: Config) => c._config.refinement.showMetadataInViewer);


  public constructor(@Inject(MAT_DIALOG_DATA) data: any, readonly _resolver: ResolverService, readonly _vbs: VbsSubmissionService, private _ngZone: NgZone, private _configService: AppConfig,) {
    if (data instanceof MediaObjectScoreContainer) {
      this._segment = data.representativeSegment;
    } else if (data instanceof MediaSegmentScoreContainer) {
      this._segment = data;
    } else {
      throw new Error('You must either provide a MediaObjectScoreContainer or a SegmentScoreContainer to an instance von QuickViewerComponent!');
    }
    this.mediaobject = this._segment.objectScoreContainer
  }

  ngAfterContentInit() {
    this._configService.configAsObservable.subscribe(c => {
      this._config = c
    })
  }

  /**
   * Initialize the openseadragon viewer to load the IIIF Image API resource if applicable
   */
  ngAfterViewInit() {
    let url = ResolverService.iiifUrlToObject(this.mediaobject, true);
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
    this._vbs.submitSegment(this._segment);
  }
}
