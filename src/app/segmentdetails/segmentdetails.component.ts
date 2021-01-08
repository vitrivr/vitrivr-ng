import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {QueryService} from '../core/queries/query.service';
import {ResolverService} from '../core/basics/resolver.service';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {MediaSegmentDragContainer} from '../shared/model/internal/media-segment-drag-container.model';
import {MediaObjectDragContainer} from '../shared/model/internal/media-object-drag-container.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {HtmlUtil} from '../shared/util/html.util';
import {filter, map} from 'rxjs/operators';
import {ContextKey, InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';
import {EventBusService} from '../core/basics/event-bus.service';
import {PreviousRouteService} from '../core/basics/previous-route.service';
import {MediaObjectDescriptor, MediaSegmentDescriptor, MetadataService, ObjectService, SegmentService} from '../../../openapi/cineast';
import {ObjectviewerComponent} from '../objectdetails/objectviewer.component';
import {MetadataDetailsComponent} from '../objectdetails/metadata-details.component';
import {SegmentFeaturesComponent} from './segment-features.component';


@Component({
  selector: 'app-segment-details',
  templateUrl: 'segmentdetails.component.html',
  styleUrls: ['../objectdetails/objectdetails.component.css']
})
export class SegmentdetailsComponent implements AfterViewInit {

  @ViewChild('objectviewerComponent')
  private objectviewer: ObjectviewerComponent;

  @ViewChild('segmentFeaturesComponent')
  segmentFeatures: SegmentFeaturesComponent;

  /** The observable that provides the MediaObjectMetadata for the active object. */
  private _mediaObjectObservable: BehaviorSubject<MediaObjectDescriptor> = new BehaviorSubject(undefined);
  private _mediaSegmentObservable: BehaviorSubject<MediaSegmentDescriptor> = new BehaviorSubject(undefined);
  _objMetadata: BehaviorSubject<Map<string, string>> = new BehaviorSubject<Map<string, string>>(new Map())
  _segMetadata: BehaviorSubject<Map<string, string>> = new BehaviorSubject<Map<string, string>>(new Map())

  /** Currently selected objectID */
  private segmentIdObservable: Observable<string>;

  constructor(private _route: ActivatedRoute,
              private _snackBar: MatSnackBar,
              private _metadataLookup: MetadataService,
              private _query: QueryService,
              private  _eventBusService: EventBusService,
              public _resolver: ResolverService,
              private _historyService: PreviousRouteService,
              private _objectService: ObjectService,
              private _segmentService: SegmentService
  ) {
    /** Generate observables required to create the view. */
    this.segmentIdObservable = _route.params.pipe(
      map(p => p['segmentId']),
      filter(p => p != null)
    );
  }

  get mediaobject(): Observable<MediaObjectDescriptor> {
    return this._mediaObjectObservable.pipe(filter(el => el !== undefined));
  }

  get mediasegment(): Observable<MediaSegmentDescriptor> {
    return this._mediaSegmentObservable.pipe(filter(el => el !== undefined));
  }

  /**
   * Whether we are currently loading information about segments / the object
   */
  get loading(): Observable<boolean> {
    return this.mediaobject.combineLatest(this.mediasegment, (obj, seg) => {
      return !obj.name || !seg.objectId
    })
  }

  ngAfterViewInit() {
    this.segmentIdObservable.pipe(
      map(segmentId => {
        this._segmentService.findSegmentById(segmentId).subscribe(segResult => {
          let message: string = null;
          if (segResult.content.length === 0) {
            message = `Cineast returned no results for segment id ${segmentId}. Returning to gallery...`;
          }
          const segment = segResult.content[0]
          if (!segment) {
            message = `Cineast returned no segment for id ${segmentId}. Returning to gallery...`
          }
          if (message) {
            this._snackBar.open(message, '', <MatSnackBarConfig>{duration: 5000});
            this._historyService.goToRoot();
          }

          this._mediaSegmentObservable.next(segment)
          this.segmentFeatures.onLoadFeaturesButtonClicked(segment)
          /** Retrieve all object information for segment */
          this._objectService.findObjectsByAttribute('id', segment.objectId).subscribe(objResult => {
            message = null;
            if (objResult.content.length === 0) {
              message = `Cineast returned no results for object ${segment.objectId} . Returning to gallery...`;
            }
            if (objResult.content[0].objectId === '') {
              message = `Cineast returned no object descriptor for object ${segment.objectId} . Returning to gallery...`;
            }
            if (message) {
              this._snackBar.open(message, '', <MatSnackBarConfig>{duration: 5000});
              this._historyService.goToRoot();
            }
            const object = objResult.content[0]
            this._mediaObjectObservable.next(object)
          })
          /** End of object retrieval */
        })
        /** End of segment retrieval */
      })
    ).subscribe();

    /** Perform Metadata lookup */
    this.mediasegment.subscribe(seg => {
      this._metadataLookup.findSegMetaById(seg.segmentId).subscribe(res => {
        if (res.content) {
          const md = new Map();
          res.content.forEach(metadata => {
            md.set(`${metadata.domain}.${metadata.key}`, metadata.value)
          })
          this._segMetadata.next(md);
        }
      })
    })

    /** Perform object metadata lookup */
    this.mediaobject.subscribe(obj => {
      this._metadataLookup.findSegMetaById(obj.objectId).subscribe(res => {
        if (res.content) {
          const md = new Map();
          res.content.forEach(metadata => {
            md.set(`${metadata.domain}.${metadata.key}`, metadata.value)
          })
          this._objMetadata.next(md);
        }
      })
    })
  }

  /**
   * Event Handler: Whenever a segment is dragged, that segment is converted to JSON and added to the dataTransfer
   * object of the drag event.
   *
   * @param event Drag event
   */
  public onSegmentDrag(event) {
    event.dataTransfer.setData(MediaSegmentDragContainer.FORMAT, new MediaSegmentDragContainer(this._mediaObjectObservable.getValue(), this._mediaSegmentObservable.getValue()).toJSON());
    event.dataTransfer.setData(MediaObjectDragContainer.FORMAT, MediaObjectDragContainer.fromDescriptor(this._mediaObjectObservable.getValue()).toJSON());
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
  public onMltClick(segment: MediaSegmentDescriptor) {
    this._query.findMoreLikeThis(segment, this._mediaObjectObservable.getValue().mediatype);
  }

  public onInformationButtonClicked(segment: MediaSegmentDescriptor) {
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
}
