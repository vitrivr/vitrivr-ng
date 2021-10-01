import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {QueryService} from '../core/queries/query.service';
import {ResolverService} from '../core/basics/resolver.service';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {MediaSegmentDragContainer} from '../shared/model/internal/media-segment-drag-container.model';
import {MediaObjectDragContainer} from '../shared/model/internal/media-object-drag-container.model';
import {Observable} from 'rxjs';
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

  _mediaObject: MediaObjectDescriptor;
  _mediaSegment: MediaSegmentDescriptor;
  _objMetadata: Map<string, string>;
  _segMetadata: Map<string, string>;
  _loading = true

  /** Currently selected objectID */
  private segmentIdObservable: Observable<string>;

  constructor(private _route: ActivatedRoute,
              private _snackBar: MatSnackBar,
              private _metadataLookup: MetadataService,
              private _query: QueryService,
              private _eventBusService: EventBusService,
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

  /**
   * Triggered whenever someone clicks the 'Back' button. Returns to the last page,
   * i.e. usually the gallery.
   */
  public onBackClick() {
    if (this._historyService.getPreviousRoute()) {
      this._historyService.goToPrevious();
      return
    }
    this._historyService.goToRoot();
  }

  /**
   * Whether we are currently loading information about segments / the object
   */
  private updateLoading() {
    if (!this._mediaObject || !this._mediaSegment) {
      this._loading = true
      return
    }
    this._loading = !this._mediaObject.name || !this._mediaSegment.objectId
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

          this._mediaSegment = segment

          /** Perform Metadata lookup for segment*/
          this._metadataLookup.findSegMetaById(segment.segmentId).subscribe(res => {
            if (res.content) {
              const md = new Map();
              res.content.forEach(metadata => {
                md.set(`${metadata.domain}.${metadata.key}`, metadata.value)
              })
              this._segMetadata = md
              this.updateLoading()
            }
          })
          /** Retrieve feature information */
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
            this._mediaObject = objResult.content[0]

            /** fetch object metadata */
            this._metadataLookup.findSegMetaById(this._mediaObject.objectId).subscribe(res => {
              if (res.content) {
                const md = new Map();
                res.content.forEach(metadata => {
                  md.set(`${metadata.domain}.${metadata.key}`, metadata.value)
                })
                this._objMetadata = md
                this.updateLoading()
              }
            })
          })
          /** End of object retrieval */
        })
        /** End of segment retrieval */
      })
    ).subscribe();
  }

  /**
   * Event Handler: Whenever a segment is dragged, that segment is converted to JSON and added to the dataTransfer
   * object of the drag event.
   *
   * @param event Drag event
   */
  public onSegmentDrag(event) {
    event.dataTransfer.setData(MediaSegmentDragContainer.FORMAT, new MediaSegmentDragContainer(this._mediaObject, this._mediaSegment).toJSON());
    event.dataTransfer.setData(MediaObjectDragContainer.FORMAT, MediaObjectDragContainer.fromDescriptor(this._mediaObject).toJSON());
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
    this._query.findMoreLikeThis(segment, this._mediaObject.mediatype);
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
