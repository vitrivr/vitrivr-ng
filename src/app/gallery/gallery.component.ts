import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";
import {QueryChange, QueryService} from "../core/queries/query.service";
import {Router} from "@angular/router";
import {MediaObject} from "../shared/model/media/media-object.model";
import {ResolverService} from "../core/basics/resolver.service";
import {SegmentScoreContainer} from "../shared/model/features/scores/segment-score-container.model";

@Component({
    moduleId: module.id,
    selector: 'gallery',
    templateUrl: 'gallery.component.html',
    styleUrls: ['gallery.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class GalleryComponent implements OnInit, OnDestroy {

    /** List of MediaObjectScoreContainers currently displayed by the gallery. */
    protected _mediaobjects : MediaObjectScoreContainer[] = [];

    /** Reference to the MediaObjectScoreContainer that is currently in focus. */
    protected _focus: MediaObjectScoreContainer;

    /* Indicator whether the progress bar should be visible. */
    private _loading : boolean = false;

    /** Local reference to the subscription to the QueryService. */
    protected _queryServiceSubscription;

    /**
     * Default constructor.
     *
     * @param _queryService
     * @param _resolver
     * @param _router
     */
    constructor(protected _cdr: ChangeDetectorRef, protected _queryService : QueryService, protected _resolver: ResolverService, protected _router: Router) {}

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit(): void {
        this._queryServiceSubscription = this._queryService.observable
            .filter(msg => ["STARTED", "ENDED", "ERROR", "UPDATED", "CLEAR"].indexOf(msg) > -1)
            .subscribe((msg) => this.onQueryStateChange(msg));

        if (this._queryService.size() > 0) {
            this.updateGallery();
        }
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the QueryService subscription.
     */
    public ngOnDestroy() {
        this._queryServiceSubscription.unsubscribe();
        this._queryServiceSubscription = null;
    }

    /**
     *
     * @return {MediaObjectScoreContainer[]}
     */
    get mediaobjects(): MediaObjectScoreContainer[] {
        return this._mediaobjects;
    }

    /**
     * Getter for loading.
     *
     * @return {boolean}
     */
    get loading(): boolean {
        return this._loading;
    }

    /**
     * Sets the focus to the provided MediaObjectScoreContainer.
     *
     * @param focus
     */
    public setFocus(focus: MediaObjectScoreContainer) {
        this._focus = focus;
    }

    /**
     * Returns true, if the provided MediaObjectScoreContainer is currently
     * in focus and false otherwise.
     *
     * @param mediaobject
     * @return {boolean}
     */
    public inFocus(mediaobject: MediaObjectScoreContainer) {
        return this._focus == mediaobject;
    }

    /**
     * Triggered whenever a user clicks on the object details button. Triggers a
     * transition to the ObjectdetailsComponent.
     *
     * @param object MediaObject for which details should be displayed.
     */
    public onDetailsButtonClicked(object: MediaObjectScoreContainer) {
        this._router.navigate(['/mediaobject/' + object.objectId]);
    }


    /**
     * Triggered whenever a user clicks on the MLT (= MoreLikeThis) button. Triggers
     * a MLT query with the QueryService.
     *
     * @param segment SegmentScoreContainer which should be used for MLT.
     */
    public onMltButtonClicked(segment: SegmentScoreContainer) {
       this._queryService.findMoreLikeThis(segment.segmentId);
    }

    /**
     * Invoked whenever the QueryService reports that the results were updated. Causes
     * the gallery to be re-rendered.
     *
     * @param msg QueryChange message
     */
    protected onQueryStateChange(msg: QueryChange) {
        if (msg == 'STARTED') this._loading = true;
        if (msg == 'ENDED') this._loading = false;
        if (msg == 'ERROR') this._loading = false;

        this.updateGallery();
        this._cdr.markForCheck();
    }

    /**
     * This method is used internally to update the gallery view.
     */
    protected updateGallery() {
        let cache : MediaObjectScoreContainer[] = [];
        this._queryService.forEach(function(value : MediaObjectScoreContainer, key : string) {
            cache.push(value)
        }, true);
        if (cache.length > 1) {
            cache.sort((a : MediaObjectScoreContainer,b : MediaObjectScoreContainer) => MediaObjectScoreContainer.compareAsc(a,b))
        }

        /* Set the list of Mediaobjects and reset the object in focus. */
        this._mediaobjects = cache;
        this._focus = null;
    }
}