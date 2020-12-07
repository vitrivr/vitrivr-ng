import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {QueryService} from '../core/queries/query.service';
import {ResolverService} from '../core/basics/resolver.service';
import {SegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';
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
import {Tag} from '../shared/model/misc/tag.model';
import {OrderType} from '../shared/pipes/containers/order-by.pipe';
import {ConfigService} from '../core/basics/config.service';
import {LookupService} from '../core/lookup/lookup.service';
import {ObjectviewerComponent} from './objectviewer.component';
import {MediaSegment} from '../shared/model/media/media-segment.model';


@Component({
  selector: 'app-object-details',
  templateUrl: 'objectdetails.component.html',
  styleUrls: ['objectdetails.component.css']
})
export class ObjectdetailsComponent implements OnInit {
  /** */
  @ViewChild('objectviewerComponent')
  private objectviewer: ObjectviewerComponent;

  /* Container */
  private _container: MediaObjectScoreContainer;
  /** The observable that provides the MediaObjectMetadata for the active object. */
  private _mediaObjectObservable: BehaviorSubject<MediaObjectScoreContainer> = new BehaviorSubject(undefined);

  private _lsc = false;

  orderType: OrderType;
  _tagsPerSegment: Tag[] = [];
  _captionsPerSegment: string[] = [];
  _asrPerSegment: string[] = [];
  _ocrPerSegment: string[] = [];
  _activeSegmentId: string;

  /** Currently selected objectID */
  private objectIdObservable: Observable<string>;

  constructor(private _route: ActivatedRoute,
              private _snackBar: MatSnackBar,
              private _query: QueryService,
              private  _eventBusService: EventBusService,
              public _resolver: ResolverService,
              private _historyService: PreviousRouteService,
              private _lookupService: LookupService,
              private _config: ConfigService) {

    _config.subscribe(config => {
      this._lsc = config.get<boolean>('competition.lsc');
      if (this._lsc) {
        this.orderType = OrderType.SEGMENT_ID
      } else {
        this.orderType = OrderType.SCORE;
      }
    });

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
        this._lookupService.getMultimediaObject(objectId).subscribe(result => {
          let message: string = null;
          if (result.content.length === 0) {
            message = `Cineast returned no results for object ${objectId} . Returning to gallery...`;
          }
          if (result.content[0].objectId === '') {
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
        this._lookupService.getMultimediaSegmentsByObjectId(objectId).subscribe(result => {
          if (!this._container.objectId) {
            this._container.objectId = result.content[0].objectId
          }
          this._container.segments = result.content.map(seg => new SegmentScoreContainer(seg, this._container))
          this.updateContainer()
        })
        return this._container;
      })
    ).subscribe()
  }

  /**
   * Trigger an update for the media object observable. Should be called after changes.
   */
  private updateContainer() {
    this._mediaObjectObservable.next(this._container)
  }

  get mediaobject(): Observable<MediaObjectScoreContainer> {
    return this._mediaObjectObservable.pipe(filter(el => el !== undefined));
  }

  /**
   * Whether we are currently loading information about segments / the object
   */
  get loading(): Observable<boolean> {
    return this.mediaobject.map(obj => !obj.name || obj.segments.length === 0)
  }

  /**
   * Event Handler: Whenever a segment is dragged, that segment is converted to JSON and added to the dataTransfer
   * object of the drag event.
   *
   * @param event Drag event
   * @param segment SegmentScoreContainer that is being dragged.
   */
  public onSegmentDrag(event, segment: SegmentScoreContainer) {
    event.dataTransfer.setData(MediaSegmentDragContainer.FORMAT, MediaSegmentDragContainer.fromScoreContainer(segment).toJSON());
    event.dataTransfer.setData(MediaObjectDragContainer.FORMAT, MediaObjectDragContainer.fromScoreContainer(segment.objectScoreContainer).toJSON());
  }

  /**
   * Triggered whenever someone clicks the 'Play' button. Playback starts from the clicked segment.
   *
   * @param segment SegmentScoreContainer that is being clicked.
   */
  public onPlayClick(segment: MediaSegment) {
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
  public onMltClick(segment: SegmentScoreContainer) {
    this._query.findMoreLikeThis(segment);
  }

  public onInformationButtonClicked(segment: SegmentScoreContainer) {
    this._snackBar.openFromComponent(MetadataDetailsComponent, <MatSnackBarConfig>{data: segment, duration: 2500});

    /* Emit an EXAMINE event on the bus. */
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXAMINE, context)))
  }

  public onLoadFeaturesButtonClicked(segment: SegmentScoreContainer) {
    this._tagsPerSegment = [];
    this._captionsPerSegment = [];
    this._asrPerSegment = [];
    this._ocrPerSegment = [];
    this._activeSegmentId = segment.segmentId;

    /* Emit an EXAMINE event on the bus. */
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.LOAD_FEATURES, context)));

    // get the tags associated with a segmentId
    this._lookupService.getTagIDsPerElementId(segment.segmentId).subscribe(function (tagIds) {
      this._lookupService.getTagById(tagIds).subscribe(function (tags) { // needed to receive remaining information for a tag object, since cineast only sends its id
        this._tagsPerSegment = tags;
      }.bind(this));
    }.bind(this));
    // get the captions associated with a segmentId
    this._lookupService.getCaptions(segment.segmentId).subscribe(function (captions) {
      this._captionsPerSegment = captions.featureValues;
    }.bind(this));
    // get the ASR data associated with a segmentId
    this._lookupService.getAsr(segment.segmentId).subscribe(function (asr) {
      this._asrPerSegment = asr.featureValues;
    }.bind(this));
    // get the OCR data associated with a segmentId
    this._lookupService.getOcr(segment.segmentId).subscribe(function (ocr) {
      this._ocrPerSegment = ocr.featureValues;
    }.bind(this));
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

  public onLoadAllButtonClicked(segment: SegmentScoreContainer) {
    this._query.lookupNeighboringSegments(segment.segmentId, 1000);
  }

  public sortAlphabetically(tagsArray: Tag[]): Tag[] {
    tagsArray.sort(function (a, b) {
      const textA = a.name.toLowerCase();
      const textB = b.name.toLowerCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    return tagsArray;
  }
}
