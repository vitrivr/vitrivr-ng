import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MediaMetadata} from "../shared/model/media/media-metadata.model";
import {MetadataLookupService} from "../core/lookup/metadata-lookup.service";
import {QueryService} from "../core/queries/query.service";
import {MediaObject} from "../shared/model/media/media-object.model";
import {ResolverService} from "../core/basics/resolver.service";
import {SegmentScoreContainer} from "../shared/model/features/scores/segment-score-container.model";
import {Location} from "@angular/common";
import {MdSnackBar} from "@angular/material";
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";

@Component({
    moduleId: module.id,
    selector: 'objectdetails',
    templateUrl: 'objectdetails.component.html'
})


export class ObjectdetailsComponent implements OnInit {
    /** */
    @ViewChild('audioplayer')
    private audioplayer: any;

    /** */
    @ViewChild('videoplayer')
    private videoplayer: any;

    /** ID of the media object that is currently examined. */
    private _objectId: string;

    /** ID of the media object that is currently examined. */
    private _mediaobject: MediaObjectScoreContainer;

    /** List of MediaMetadata items for the current multimedia object. */
    private _metadata: MediaMetadata[] = [];

    /** List of SegmentScoreContainrs items for the current multimedia object. */
    private _segments: SegmentScoreContainer[] = [];

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
                private _snackBar: MdSnackBar) {
    }

    /**
     * Lifecycle hook (onInit): Invoked once when the component is initialized. Subscribes to the different services
     * and installs appropriate callback methods.
     */
    public ngOnInit() {
        /* Subscribes to changes of the Router class. Whenever the parameter becomes available,
         * the onParamsAvailable method is invoked. */
        this._route.params.first().subscribe((params: Params) => this.onParamsAvailable(params));
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
     *
     * @param start
     */
    public onSegmentClick(start: number) {
        if (this.audioplayer !== undefined) {
            this.audioplayer.nativeElement.currentTime = start;
            this.audioplayer.nativeElement.play();
        } else if (this.videoplayer !== undefined) {
            this.videoplayer.nativeElement.currentTime = start;
            this.videoplayer.nativeElement.play();
        }
    }

    /**
     * Triggered whenever someone clicks the 'Back' button. Returns to the last page,
     * i.e. usually the gallery.
     */
    public onBackClick() {
        this._location.back()
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