import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MediaObjectMetadata} from "../shared/model/media/media-object-metadata.model";
import {MetadataLookupService} from "../core/lookup/metadata-lookup.service";
import {QueryService} from "../core/queries/query.service";
import {MediaObject} from "../shared/model/media/media-object.model";
import {ResolverService} from "../core/basics/resolver.service";
import {SegmentScoreContainer} from "../shared/model/results/scores/segment-score-container.model";
import {Location} from "@angular/common";
import {MatDialog, MatSnackBar, MatSnackBarConfig} from "@angular/material";
import {MediaObjectScoreContainer} from "../shared/model/results/scores/media-object-score-container.model";
import {ImagecropComponent} from "./imagecrop.component";
import {MediaSegmentDragContainer} from "../shared/model/internal/media-segment-drag-container.model";
import {MediaObjectDragContainer} from "../shared/model/internal/media-object-drag-container.model";
import {EMPTY, Observable, of} from "rxjs";
import {HtmlUtil} from "../shared/util/html.util";
import {catchError, filter, first, flatMap, map, tap} from "rxjs/operators";

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

    /** The observable that returns the objectID provided by the ActivatedRoute service. */
    private _objectIdObservable : Observable<string>;

    /** The observable that provides the MediaObjectMetadata for the active object. */
    private _metadataObservable : Observable<MediaObjectMetadata[]>;

    /** The observable that provides the MediaObjectMetadata for the active object. */
    private _mediaObjectObservable : Observable<MediaObjectScoreContainer>;

    /**
     * Constructor for ObjectdetailsComponent.
     *
     * @param {ActivatedRoute} _route
     * @param {Router} _router
     * @param {MatSnackBar} _snackBar
     * @param {MetadataLookupService} _metadataLookup
     * @param {QueryService} _query
     * @param {Location} _location
     * @param {ResolverService} _resolver
     * @param {MatDialog} _dialog
     */
    constructor(_route: ActivatedRoute,
                _router: Router,
                _snackBar: MatSnackBar,
                _metadataLookup: MetadataLookupService,
                private _query: QueryService,
                private _location: Location,
                private _resolver: ResolverService,
                private _dialog: MatDialog) {


        /** Generate observables required to create the view. */
        this._objectIdObservable = _route.params.pipe(
            map(p => p['objectId']),
            tap(objectID => {
                if (!_query.results || !_query.results.hasObject(objectID)) {
                    throw new Error(`The provided objectId ${objectID} does not exist in the results. Returning to gallery...`);
                }
            }),
            catchError((err, obs) => {
                _snackBar.open(err.message,'',<MatSnackBarConfig>{duration: 2500});
                _router.navigate(['/gallery']);
                return EMPTY;
            }),
            first()
        );
        this._metadataObservable = this._objectIdObservable.pipe(
            filter(objectId => objectId != null),
            flatMap(objectId => _metadataLookup.lookup(objectId)),
            map(v => v.content)
        );
        this._mediaObjectObservable = this._objectIdObservable.pipe(
            filter(objectId => objectId != null),
            map(objectId => _query.results.getObject(objectId))
        );
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
        const imagePath = this._resolver.pathToObject(object);
        const dialogRef = this._dialog.open(ImagecropComponent, {data : imagePath});
        dialogRef.afterClosed().pipe(first()).subscribe(() => {});
    }

    /**
     * Getter for the local _objectIdObservable.
     *
     * @returns {MediaObject}
     */
    get objectId(): Observable<string> {
        return this._objectIdObservable;
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
     * Getter for the local _metadataObservable.
     *
     * @returns {MediaObjectMetadata[]}
     */
    get metadata(): Observable<MediaObjectMetadata[]> {
        return this._metadataObservable;
    }

    /**
     * Replaces all links in the provided text by links.
     *
     * @param {string} str String that should be replaced.
     * @return {string} Modified string.
     */
    public textWithLink(str: string): string {
        return HtmlUtil.replaceUrlByLink(str, "_blank");
    }
}
