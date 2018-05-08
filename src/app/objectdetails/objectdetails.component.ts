import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MediaMetadata} from "../shared/model/media/media-metadata.model";
import {MetadataLookupService} from "../core/lookup/metadata-lookup.service";
import {QueryService} from "../core/queries/query.service";
import {MediaObject} from "../shared/model/media/media-object.model";
import {ResolverService} from "../core/basics/resolver.service";
import {SegmentScoreContainer} from "../shared/model/results/scores/segment-score-container.model";
import {Location} from "@angular/common";
import {MatDialog, MatSnackBar} from "@angular/material";
import {MediaObjectScoreContainer} from "../shared/model/results/scores/media-object-score-container.model";
import {ImagecropComponent} from "./imagecrop.component";
import {MediaSegmentDragContainer} from "../shared/model/internal/media-segment-drag-container.model";
import {MediaObjectDragContainer} from "../shared/model/internal/media-object-drag-container.model";
import {Observable} from "rxjs/Observable";
import {HtmlUtil} from "../shared/util/html.util";

@Component({
    moduleId: module.id,
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

    /** List of MediaMetadata items for the current multimedia object. */
    private _metadata: Array<MediaMetadata> = [];

    private _objectId: string;

    constructor(private _query: QueryService,
                private _route: ActivatedRoute,
                private _location: Location,
                private _metadataLookup: MetadataLookupService,
                private _resolver: ResolverService,
                private _snackBar: MatSnackBar,
                private _dialog: MatDialog) {
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
            this.audioplayer.nativeElement.currentTime = segment.starttime;
            this.audioplayer.nativeElement.play();
        } else if (this.videoplayer !== undefined) {
            this.videoplayer.nativeElement.currentTime = segment.starttime;
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
        this._query.findMoreLikeThis(segment.segmentId);
    }

    /**
     * Triggered whenever someone clicks the 'Back' button. Returns to the last page,
     * i.e. usually the gallery.
     */
    public onBackClick() {
        this._location.back()
    }

    public onImageViewerClicked(object: MediaObjectScoreContainer) {
        const imagePath = this._resolver.pathToObjectForContainer(object);
        const dialogRef = this._dialog.open(ImagecropComponent, {data : imagePath});
        dialogRef.afterClosed().first().subscribe(() => {});
    }

    /**
     * Getter for media object.
     *
     * @returns {MediaObject}
     */
    get mediaobject(): Observable<MediaObjectScoreContainer> {
        if (!this._objectId) {
          this._route.params.first().subscribe(params => {
            this._objectId = params['objectId'];
          })
        }
        return new Observable(observer => observer.next(this._query.results.getObject(this._objectId)));
    }

    /**
     * Getter for metdata
     *
     * @returns {MediaMetadata[]}
     */
    get metadata(): Observable<MediaMetadata[]> {
      if (!this._objectId) {
        this._route.params.first().subscribe(params => {
          this._objectId = params['objectId']
        })
      }
      return new Observable(observer => {
          if (!this._metadata || this._metadata.length === 0) {
            this._metadataLookup.lookup(this._objectId).subscribe(md => {
              this._metadata = md;
              observer.next(this._metadata);
              observer.complete();
            });
          }
          if (this._metadata && this._metadata !== []) {
            observer.next(this._metadata);
            observer.complete();
          } else {
            observer.next(this._metadata);
          }
      });
    }

    /**
     * Checks if the provided string is a URL.
     *
     * @param {string} str String that should be checked.
     * @return {boolean} Flag indicating whether or not the string is a URL.
     */
    public isUrl(str: string): boolean {
        return HtmlUtil.isUrl(str);
    }

    /**
     * Opens the provided URL in a new window.
     *
     * @param {string} url
     */
    public openUrl(url: string) {
        window.open(url,'_blank')
    }
}
