import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MediaMetadata} from "../shared/model/media/media-metadata.model";
import {MetadataLookupService} from "../core/lookup/metadata-lookup.service";
import {QueryService} from "../core/queries/query.service";
import {MediaObject} from "../shared/model/media/media-object.model";
import {ResolverService} from "../core/basics/resolver.service";
import {SegmentScoreContainer} from "../shared/model/features/scores/segment-score-container.model";
import {Location} from "@angular/common";
import {MatDialog, MatSnackBar} from "@angular/material";
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";
import {ImagecropComponent} from "./imagecrop.component";
import {ResultsContainer} from "../shared/model/features/scores/results-container.model";
import {MediaSegmentDragContainer} from "../shared/model/internal/media-segment-drag-container.model";
import {MediaObjectDragContainer} from "../shared/model/internal/media-object-drag-container.model";

@Component({
    moduleId: module.id,
    selector: 'objectdetails',
    templateUrl: 'objectdetails.component.html',
    styleUrls: ['objectdetails.component.css']
})


export class ObjectdetailsComponent implements OnInit {
    /** */
    @ViewChild('audioplayer')
    private audioplayer: any;

    /** */
    @ViewChild('videoplayer')
    private videoplayer: any;

    /* */
    @ViewChild('imageviewer')
    private imageviewer: any;

    /** ID of the media object that is currently examined. */
    private _objectId: string;

    /** ID of the media object that is currently examined. */
    private _mediaobject: MediaObjectScoreContainer;

    /** List of MediaMetadata items for the current multimedia object. */
    private _metadata: MediaMetadata[] = [];

    /** List of SegmentScoreContainrs items for the current multimedia object. */
    private _segments: SegmentScoreContainer[] = [];

    /** */
    private _results : ResultsContainer;

    /**
     *
     * @param _route
     * @param _location
     * @param _query
     * @param _metadataLookup
     * @param _resolver
     */
    constructor(private _query : QueryService,
                private _route: ActivatedRoute,
                private _location: Location,
                private _metadataLookup: MetadataLookupService,
                private _resolver: ResolverService,
                private _snackBar: MatSnackBar,
                private _dialog: MatDialog) {

        this._results = _query.results;
    }

    /**
     * Lifecycle hook (onInit): Subscribes to changes of the Router class. Whenever the parameter becomes available,
     * the onParamsAvailable method is invoked.
     */
    public ngOnInit() {
        this._route.params.first().subscribe((params: Params) => this.onParamsAvailable(params));
    }

    /**
     * Invoked when parameters from the ActiveRouter become available.
     *
     * @param params Parameters.
     */
    private onParamsAvailable(params: Params) {
        this._objectId = params['objectId'];
        if (this._objectId && this._results && this._results.hasObject(this._objectId)) {
            this.refresh();
        } else {
            this._snackBar.open("The specified objectId '" + this._objectId + "' not found in the query results. Returning...", null, {duration: 3000}).afterDismissed().first().subscribe(() => {
                this._location.back()
            });
        }
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
     * Invoked when a user clicks the selection/favourie button. Toggles the selection mode of the SegmentScoreContainer.
     *
     * @param {SegmentScoreContainer} segment
     */
    public onStarButtonClicked(segment: SegmentScoreContainer) {
        segment.toggleMark();
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

    /**
     *
     */
    public onImageViewerClicked() {
        let imagePath = this._resolver.pathToObject(this._mediaobject); //this._resolver.pathToThumbnail(this._mediaobject.mediatype, this._mediaobject.objectId, this._mediaobject.objectId + "_1"); //
        let dialogRef = this._dialog.open(ImagecropComponent, {data : imagePath});
        dialogRef.afterClosed().first().subscribe((result) => {

        });
    }

    /**
     * Refreshes the view by loading all necessary lines.
     */
    private refresh() {
        /* Fetch the media-object from the QueryService. */
        this._mediaobject = this._results.getObject(this._objectId);
        this._segments = this._mediaobject.segments.slice().sort((a, b) => SegmentScoreContainer.compareAsc(a,b));

        /* Lookup metadata lines for the provided object. */
        this._metadataLookup.observable().first().subscribe((msg) => {
            this._metadata = msg.content
        });
        this._metadataLookup.lookup(this._objectId);
    }

    /**
     * Getter for object id.
     *
     * @return {string}
     */
    get objectId(): string {
        return this._objectId;
    }

    /**
     * Getter for media object.
     *
     * @returns {MediaObject}
     */
    get mediaobject(): MediaObject {
        return this._mediaobject;
    }

    /**
     * Getter for metdata
     *
     * @returns {MediaMetadata[]}
     */
    get metadata(): MediaMetadata[] {
        return this._metadata;
    }

    /**
     * Getter for segments.
     *
     * @returns {SegmentScoreContainer[]}
     */
    get segments(): SegmentScoreContainer[] {
        return this._segments;
    }
}
