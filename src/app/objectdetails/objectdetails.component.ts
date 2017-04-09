import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MediaMetadata} from "../shared/model/media/media-metadata.model";
import {MetadataLookupService} from "../core/lookup/metadata-lookup.service";
import {QueryService} from "../core/queries/query.service";
import {MediaObject} from "../shared/model/media/media-object.model";
import {ResolverService} from "../core/basics/resolver.service";
import {SegmentScoreContainer} from "../shared/model/features/scores/segment-score-container.model";
import {Subscription} from "rxjs";

@Component({
    moduleId: module.id,
    selector: 'objectdetails',
    templateUrl: 'objectdetails.component.html'
})


export class ObjectdetailsComponent implements OnInit, OnDestroy{
    /** */
    @ViewChild('audioplayer')
    private audioplayer: any;

    /** */
    @ViewChild('videoplayer')
    private videoplayer: any;

    /** */
    private objectId: string;

    /** */
    private _mediaobject: MediaObject;

    /** */
    private _metadata: MediaMetadata[] = [];

    /** */
    private _segments: SegmentScoreContainer[] = [];

    /** Reference to the Subscription for Router. */
    private routeSubscription : Subscription;

    /** Reference to the Subscription for MetadataLookupService. */
    private metadataLookupSubscription : Subscription;

    /**
     *
     * @param _route
     * @param _router
     * @param _query
     * @param _metadataLookup
     * @param _resolver
     */
    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _query : QueryService,
                private _metadataLookup: MetadataLookupService,
                private _resolver: ResolverService) {

    }

    /**
     * Invoked once when the component is initialized. Subscribes to the different services
     * and installs appropriate callback methods.
     */
    public ngOnInit() {
        /* Subscribes to changes of the Router class. Whenever the parameter becomes available,
         * the onParamsAvailable method is invoked. */
        this.routeSubscription = this._route.params.subscribe((params: Params) => this.onParamsAvailable(params));

        /* Subscribes to the MetadataLookupService; whenever a result is returned, that result
         * is assigned to the local metadata field. */
        this.metadataLookupSubscription = this._metadataLookup.observable().subscribe((msg) => {
            this._metadata = msg.content
        });
    }

    /**
     * Unsubscribes from all active subscriptions.
     */
    public ngOnDestroy() {
        this.metadataLookupSubscription.unsubscribe();
        this.routeSubscription.unsubscribe();
        this.metadataLookupSubscription = null;
        this.routeSubscription = null;
    }

    /**
     * Invoked when parameters from the ActiveRouter become available.
     *
     * @param params Parameters.
     */
    private onParamsAvailable(params: Params) {
        this.objectId = params['objectId'];
        if (this.objectId && this._query.has(this.objectId)) {
            this._metadataLookup.lookup(this.objectId);
            this.refresh();
        }
    }


    /**
     *
     * @param start
     */
    private onSegmentClick(start: number) {
        if (this.audioplayer !== undefined) {
            this.audioplayer.nativeElement.currentTime = start;
            this.audioplayer.nativeElement.play();
        } else if (this.videoplayer !== undefined) {
            this.videoplayer.nativeElement.currentTime = start;
            this.videoplayer.nativeElement.play();
        }
    }

    /**
     *
     */
    private refresh() {
        this._mediaobject = this._query.get(this.objectId).mediaObject;
        this._segments = [];
        this._query.get(this.objectId).getSegmentScores().forEach((value, key) => {
            this._segments.push(value);
        });
        this._segments.sort((a, b) => {
            return b.score-a.score;
        });
    }

    /**
     * Getter for mediaobject.
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