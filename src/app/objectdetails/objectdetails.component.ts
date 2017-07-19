import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MediaMetadata} from "../shared/model/media/media-metadata.model";
import {MetadataLookupService} from "../core/lookup/metadata-lookup.service";
import {QueryService} from "../core/queries/query.service";
import {MediaObject} from "../shared/model/media/media-object.model";
import {ResolverService} from "../core/basics/resolver.service";
import {SegmentScoreContainer} from "../shared/model/features/scores/segment-score-container.model";
import {Location} from "@angular/common";
import {MdDialog, MdSnackBar} from "@angular/material";
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";
import {ImagecropComponent} from "./imagecrop.component";

@Component({
    moduleId: module.id,
    selector: 'objectdetails',
    templateUrl: 'objectdetails.component.html',
    styleUrls: ['objectdetails.component.css']
})


export class ObjectdetailsComponent implements OnInit, OnDestroy {
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
    private _queryServiceSubscription;

    /**
     *
     * @param _route
     * @param _location
     * @param _query
     * @param _metadataLookup
     * @param _resolver
     */
    constructor(private _route: ActivatedRoute,
                private _location: Location,
                private _query : QueryService,
                private _metadataLookup: MetadataLookupService,
                private _resolver: ResolverService,
                private _snackBar: MdSnackBar,
                private _dialog: MdDialog) {
    }

    /**
     * Lifecycle hook (onInit): Subscribes to the QueryService observable and the route observable.
     */
    public ngOnInit() {
        /* Subscribes to changes of the Router class. Whenever the parameter becomes available,
         * the onParamsAvailable method is invoked. */
        this._route.params.first().subscribe((params: Params) => this.onParamsAvailable(params));
        this._queryServiceSubscription = this._query.observable.filter(msg => msg === "STARTED").subscribe(() => {
            this._location.back();
        });
    }

    /**
     * Lifecycle hook (onDestroy): Unsubscribes from the QueryService subscription.
     */
    public ngOnDestroy() {
        this._queryServiceSubscription.unsubscribe();
        this._queryServiceSubscription = null;
    }

    /**
     * Invoked when parameters from the ActiveRouter become available.
     *
     * @param params Parameters.
     */
    private onParamsAvailable(params: Params) {
        this._objectId = params['objectId'];
        if (this._objectId && this._query.has(this._objectId)) {
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
        event.dataTransfer.setData("application/vitrivr-mediasegment", JSON.stringify(segment.mediaSegment));
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
     * Refreshes the view by loading all necessary information.
     */
    private refresh() {
        /* Fetch the media-object from the QueryService. */
        this._mediaobject = this._query.get(this._objectId);
        this._segments = [];
        this._query.get(this._objectId).segmentScores.forEach((value, key) => {
            this._segments.push(value);
        });
        this._segments.sort((a, b) => SegmentScoreContainer.compareAsc(a,b));

        /* Lookup metadata information for the provided object. */
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
