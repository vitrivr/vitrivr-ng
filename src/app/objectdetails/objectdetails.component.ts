import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MetadataLookupService} from '../core/lookup/metadata-lookup.service';
import {QueryService} from '../core/queries/query.service';
import {MediaObject} from '../shared/model/media/media-object.model';
import {ResolverService} from '../core/basics/resolver.service';
import {SegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';
import {Location} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {MediaObjectScoreContainer} from '../shared/model/results/scores/media-object-score-container.model';
import {MediaSegmentDragContainer} from '../shared/model/internal/media-segment-drag-container.model';
import {MediaObjectDragContainer} from '../shared/model/internal/media-object-drag-container.model';
import {EMPTY, Observable} from 'rxjs';
import {HtmlUtil} from '../shared/util/html.util';
import {catchError, filter, map, tap} from 'rxjs/operators';
import {ContextKey, InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';
import {EventBusService} from '../core/basics/event-bus.service';
import {MetadataDetailsComponent} from './metadata-details.component';
import {PreviousRouteService} from '../core/basics/previous-route.service';
import {TagsLookupService} from '../core/lookup/tags-lookup.service';
import {Tag} from '../shared/model/misc/tag.model';

@Component({
  selector: 'objectdetails',
  templateUrl: 'objectdetails.component.html',
  styleUrls: ['objectdetails.component.css']
})
export class ObjectdetailsComponent {
  /** */
  @ViewChild('audioplayer')
  private audioplayer: any;

  /** */
  @ViewChild('videoplayer')
  private videoplayer: any;

  /* */
  @ViewChild('imageviewer')
  private imageviewer: any;

  /** The observable that provides the MediaObjectMetadata for the active object. */
  private _mediaObjectObservable: Observable<MediaObjectScoreContainer>;

  private _tagsPerSegment: Tag[] = [];
  private _captionsPerSegment: string[] = [];
  private _asrPerSegment: string[] = [];
  private _ocrPerSegment: string[] = [];

  constructor(private _route: ActivatedRoute,
              private _router: Router,
              private _snackBar: MatSnackBar,
              private _metadataLookup: MetadataLookupService,
              private _query: QueryService,
              private  _eventBusService: EventBusService,
              private _location: Location,
              private _resolver: ResolverService,
              private _dialog: MatDialog,
              private _historyService: PreviousRouteService,
              private _tagsLookupService: TagsLookupService) {


    /** Generate observables required to create the view. */
    const objectIdObservable = _route.params.pipe(
      map(p => p['objectId']),
      filter(p => p != null),
      tap(objectID => {
        if (!_query.results || !_query.results.hasObject(objectID)) {
          throw new Error(`The provided objectId ${objectID} does not exist in the results. Returning to gallery...`);
        }
      }),
      catchError((err, obs) => {
        _snackBar.open(err.message, '', <MatSnackBarConfig>{duration: 2500});
        this._historyService.goToPrevious();
        return EMPTY;
      })
    );
    this._mediaObjectObservable = objectIdObservable.pipe(
      map(objectId => _query.results.getObject(objectId))
    );
  }

  /**
   * Getter for the local _mediaObjectObservable.
   *
   * @returns {MediaObject}
   */
  get mediaobject(): Observable<MediaObjectScoreContainer> {
    return this._mediaObjectObservable;
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
  public onPlayClick(segment: SegmentScoreContainer) {
    if (this.audioplayer !== undefined) {
      this.audioplayer.nativeElement.currentTime = segment.startabs;
      this.audioplayer.nativeElement.play();
    } else if (this.videoplayer !== undefined) {
      this.videoplayer.nativeElement.currentTime = segment.startabs;
      this.videoplayer.nativeElement.play();
    }
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

  public onMetadataButtonClicked(segment: SegmentScoreContainer) {
    /* Emit an EXAMINE event on the bus. */
    this._tagsPerSegment = [];
    this._captionsPerSegment = [];
    this._asrPerSegment = [];
    this._ocrPerSegment = [];
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXAMINE, context)));
    this._tagsLookupService.getTagsPerSegmentId(segment.segmentId).subscribe(function (tagIds) {
      this._tagsLookupService.getTagById(tagIds).subscribe(function (tags) {
        this._tagsPerSegment = tags;
      }.bind(this));
    }.bind(this));
    this._metadataLookup.getCaptions(segment.segmentId).subscribe(function (captions) {
      this._captionsPerSegment = captions.content;
    }.bind(this));
    this._metadataLookup.getAsr(segment.segmentId).subscribe(function (asr) {
      this._asrPerSegment = asr.content;
    }.bind(this));
    this._metadataLookup.getOcr(segment.segmentId).subscribe(function (ocr) {
      this._ocrPerSegment = ocr.content;
    }.bind(this));
  }

  /**
   * Triggered whenever someone clicks the 'Back' button. Returns to the last page,
   * i.e. usually the gallery.
   */
  public onBackClick() {
    this._historyService.goToPrevious();
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
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXPAND, context)));
  }
}
