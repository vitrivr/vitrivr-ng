import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {QueryService} from '../core/queries/query.service';
import {ResolverService} from '../core/basics/resolver.service';
import {MediaSegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {MediaObjectScoreContainer} from '../shared/model/results/scores/media-object-score-container.model';
import {MediaSegmentDragContainer} from '../shared/model/internal/media-segment-drag-container.model';
import {MediaObjectDragContainer} from '../shared/model/internal/media-object-drag-container.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {HtmlUtil} from '../shared/util/html.util';
import {filter, map} from 'rxjs/operators';
import {ContextKey, InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';
import {EventBusService} from '../core/basics/event-bus.service';
import {MetadataDetailsComponent} from './metadata-details.component';
import {PreviousRouteService} from '../core/basics/previous-route.service';
import {OrderType} from '../shared/pipes/containers/order-by.pipe';
import {ObjectviewerComponent} from './objectviewer.component';
import {AppConfig} from '../app.config';
import {MediaSegmentDescriptor, MetadataService, ObjectService, SegmentService, TagService} from '../../../openapi/cineast';
import {SegmentFeaturesComponent} from '../segmentdetails/segment-features.component';
import {VbsSubmissionService} from '../core/vbs/vbs-submission.service';


@Component({
  selector: 'app-object-details',
  templateUrl: 'objectdetails.component.html',
  styleUrls: ['objectdetails.component.css']
})
export class ObjectdetailsComponent implements OnInit {
  orderType: OrderType;

  @ViewChild('objectviewerComponent')
  private objectviewer: ObjectviewerComponent;

  @ViewChild('segmentFeaturesComponent')
  segmentFeatures: SegmentFeaturesComponent;

  /** Current object */
  private _container: MediaObjectScoreContainer;
  /** what will actually be rendered*/
  _mediaObject: MediaObjectScoreContainer;
  _showSubmitButton = false
  _loading = false
  _segments: MediaSegmentScoreContainer[];

  private _lsc = false;
  /** Currently selected objectID */
  private objectIdObservable: Observable<string>;

  constructor(private _route: ActivatedRoute,
              private _snackBar: MatSnackBar,
              private _metadataLookup: MetadataService,
              private _query: QueryService,
              private _eventBusService: EventBusService,
              public _resolver: ResolverService,
              private _historyService: PreviousRouteService,
              private _tagService: TagService,
              private _metaService: MetadataService,
              private _objectService: ObjectService,
              private _segmentService: SegmentService,
              private _config: AppConfig,
              private readonly _vbs: VbsSubmissionService) {

    _config.configAsObservable.subscribe(config => {
      this._lsc = config.get<boolean>('competition.lsc');
      if (this._lsc) {
        this.orderType = OrderType.SEGMENT_ID
      } else {
        this.orderType = OrderType.SCORE;
      }
    });
    _vbs.isOn.subscribe(res => this._showSubmitButton = res);


    /** Generate observables required to create the view. */
    this.objectIdObservable = _route.params.pipe(
      map(p => p['objectId']),
      filter(p => p != null),
    );
  }

  ngOnInit() {
    /**
     * If there are no results available, this page has been called directly by the user and not after a query
     */
    if (!this._query.results) {
      this._container = new MediaObjectScoreContainer(undefined);
      this.orderType = OrderType.SEGMENT_TIME;
    }

    this.objectIdObservable.pipe(
      map(objectId => {
        /** If there are results available, assign the container to whatever matches */
        if (this._query.results) {
          if (!this._query.results.getObject(objectId)) {
            this._snackBar.open(`Object ${objectId} could not be found. Returning to gallery...`, '', <MatSnackBarConfig>{duration: 2500});
            this._historyService.goToPrevious();
            return
          }
          this._container = this._query.results.getObject(objectId);
          this.updateContainer();
          return
        }
        /** If there are no results available, we need to load more detail information */
        /** load object information */
        this._objectService.findObjectsByAttribute('id', objectId).subscribe(result => {
          let message: string = null;
          if (result.content.length === 0) {
            message = `Cineast returned no results for object ${objectId} . Returning to gallery...`;
          } else if (result.content[0].objectId === '') {
            message = `Cineast returned no object descriptor for object ${objectId} . Returning to gallery...`;
          }
          if (message) {
            this._snackBar.open(message, '', <MatSnackBarConfig>{duration: 5000});
            this._historyService.goToRoot();
          }
          const object = result.content[0]
          this._container.mediatype = object.mediatype;
          this._container.objectId = object.objectId;
          this._container.name = object.name;
          this._container.path = object.path;
          this._container.contentURL = object.contentURL;
          this.updateContainer()
        })
        /** load segment information */
        this._segmentService.findSegmentByObjectId(objectId).subscribe(result => {
          if (!this._container.objectId) {
            this._container.objectId = result.content[0].objectId
          }
          this._container.segments = result.content.map(seg => new MediaSegmentScoreContainer(seg, this._container))
          this.updateContainer()
        })
        /** load metadata */
        this._metaService.findMetaById(objectId).subscribe(result => {
          if (!result.content || result.content.length === 0) {
            console.log(`no metadata available for ${objectId}`)
            return
          }
          result.content.forEach(md => this._container.metadata.set(md.key, md.value))
        })
        return this._container;
      })
    ).subscribe()
  }

  /**
   * Event Handler: Whenever a segment is dragged, that segment is converted to JSON and added to the dataTransfer
   * object of the drag event.
   *
   * @param event Drag event
   * @param segment SegmentScoreContainer that is being dragged.
   */
  public onSegmentDrag(event, segment: MediaSegmentScoreContainer) {
    event.dataTransfer.setData(MediaSegmentDragContainer.FORMAT, MediaSegmentDragContainer.fromScoreContainer(segment).toJSON());
    event.dataTransfer.setData(MediaObjectDragContainer.FORMAT, MediaObjectDragContainer.fromScoreContainer(segment.objectScoreContainer).toJSON());
  }

  /**
   * Triggered whenever someone clicks the 'Play' button. Playback starts from the clicked segment.
   *
   * @param segment SegmentScoreContainer that is being clicked.
   */
  public onPlayClick(segment: MediaSegmentDescriptor) {
    if (!this.objectviewer) {
      console.log(`objectviewer not loaded yet, cannot play from segment`)
      return
    }
    this.objectviewer.onPlayClick(segment)
  }

  /**
   * Triggered whenever someone clicks the 'More-Like-This' button. The segment the click belongs to is then used to perform
   * a More-Like-This query.
   *
   * @param segment SegmentScoreContainer that is being clicked.
   */
  public onMltClick(segment: MediaSegmentScoreContainer) {
    this._query.findMoreLikeThis(segment, segment.objectScoreContainer.mediatype);
  }

  public onInformationButtonClicked(segment: MediaSegmentScoreContainer) {
    if (segment.metadata.size > 0) {
      this.showMetadata(segment)
      return
    }
    console.log(`looking up metadata for ${segment.segmentId}`)
    this._loading = true
    this._metaService.findSegMetaById(segment.segmentId).subscribe(res => {
      res.content.forEach(md => segment.metadata.set(md.key, md.value))
      this._loading = false
      this.showMetadata(segment)
    })
  }

  public showMetadata(segment: MediaSegmentScoreContainer) {
    this._snackBar.openFromComponent(MetadataDetailsComponent, <MatSnackBarConfig>{data: segment, duration: 2500});

    /* Emit an EXAMINE event on the bus. */
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXAMINE, context)))
  }

  /**
   * Replaces all links in the provided text by links.
   *
   * @param {string} str String that should be replaced.
   * @return {string} Modified string.
   */
  public textWithLink(str: string): string {
    return HtmlUtil.replaceUrlByLink(str, '_blank');
  }

  public onLoadAllButtonClicked(segment: MediaSegmentScoreContainer) {
    this._query.lookupNeighboringSegments(segment.segmentId, 1000);
  }

  /**
   * Trigger an update for the media object observable. Should be called after changes.
   */
  private updateContainer() {
    this._mediaObject = this._container
    this._loading = (!this._mediaObject.name || this._mediaObject.segments.length === 0)
    this._container.segmentsObservable.subscribe(el => this._segments = el)
  }

  public onSubmitPressed(segment: MediaSegmentScoreContainer) {
    console.debug(`submitting for segment ${segment.segmentId}`);
    this._vbs.submitSegment(segment)
  }
}
