import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MediaObjectScoreContainer} from "../../shared/model/features/scores/media-object-score-container.model";
import {QueryChange, QueryService} from "../../core/queries/query.service";
import {Router} from "@angular/router";
import {ResolverService} from "../../core/basics/resolver.service";
import {SegmentScoreContainer} from "../../shared/model/features/scores/segment-score-container.model";
import {ResultsContainer} from "../../shared/model/features/scores/results-container.model";
import {AbstractResultsViewComponent} from "../abstract-results-view.component";
import {MatSnackBar, MatSnackBarConfig} from "@angular/material";
import {FeatureDetailsComponent} from "../feature-details.component";
import {MediaSegmentDragContainer} from "../../shared/model/internal/media-segment-drag-container.model";
import {MediaSegment} from "../../shared/model/media/media-segment.model";
import {MediaObjectDragContainer} from "../../shared/model/internal/media-object-drag-container.model";

@Component({
    moduleId: module.id,
    selector: 'gallery',
    templateUrl: 'gallery.component.html',
    styleUrls: ['gallery.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent extends AbstractResultsViewComponent {
    /** List of MediaObjectScoreContainers currently displayed by the gallery. */
    protected _mediaobjects : MediaObjectScoreContainer[] = [];

    /** Reference to the MediaObjectScoreContainer that is currently in focus. */
    protected _focus: MediaObjectScoreContainer;

    /* The size of an individual tile in pixels. */
    private _tilesize : number = 250;

    /* The gap between two tile in pixels. */
    private _tilegap: number = 15;

    /**
     * Default constructor.
     *
     * @param _cdr Reference to ChangeDetectorRef used to inform component about changes.
     * @param _queryService
     * @param _resolver
     * @param _router
     * @param _snackBar
     */
    constructor(_cdr: ChangeDetectorRef, _queryService : QueryService, protected _resolver: ResolverService, protected _router: Router, protected _snackBar: MatSnackBar) {
        super(_cdr, _queryService);
    }

    /**
     * Getter for size of an individual tile in the gallery.
     *
     * @return {number}
     */
    get tilesize(): number {
        return this._tilesize;
    }

    /**
     * Adjusts the size of the tile to a new value. That value must be greater than 20. Calling this
     * method triggers an update of the component tree.
     *
     * @param {number} value
     */
    set tilesize(value: number) {
        if (value > 10) {
            this._tilesize = value;
            this._cdr.markForCheck();
        }
    }

    /**
     * Getter for gap between two individual tiles in pixels.
     *
     * @return {number}
     */
    get tilegap(): number {
        return this._tilegap;
    }

    /**
     * Adjusts the size of the gap between tiles. That value must be greater than 2px. Calling this
     * method triggers an update of the component tree.
     *
     * @param {number} value
     */
    set tilegap(value: number) {
        if (value > 2) {
            this._tilegap = value;
            this._cdr.markForCheck();
        }
    }

    /**
     *
     * @return {MediaObjectScoreContainer[]}
     */
    get mediaobjects(): MediaObjectScoreContainer[] {
        return this._mediaobjects;
    }

    /**
     * Whenever a tile is dragged, the most representative segment and the media object that tile represents is converted to JSON and
     * added to the dataTransfer object of the drag event.
     *
     * @param event Drag event
     * @param object MediaObjectScoreContainer that is being dragged.
     */
    public onTileDrag(event, object: MediaObjectScoreContainer) {
        event.dataTransfer.setData(MediaSegmentDragContainer.FORMAT, MediaSegmentDragContainer.fromScoreContainer(object.representativeSegment).toJSON());
        event.dataTransfer.setData(MediaObjectDragContainer.FORMAT, MediaObjectDragContainer.fromScoreContainer(object).toJSON());
    }

    /**
     * Sets the focus to the provided MediaObjectScoreContainer.
     *
     * @param focus
     */
    set focus(focus: MediaObjectScoreContainer) {
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
     * @param object MediaObjectScoreContainer for which details should be displayed.
     */
    public onDetailsButtonClicked(object: MediaObjectScoreContainer) {
        this._router.navigate(['/mediaobject/' + object.objectId]);
    }

    /**
     * Triggered whenever a user clicks on the MLT (= MoreLikeThis) button. Triggers
     * a MLT query with the QueryService.
     *
     * @param object MediaObjectScoreContainer which should be used for MLT.
     */
    public onMltButtonClicked(object: MediaObjectScoreContainer) {
        if (object.representativeSegment) {
            this._queryService.findMoreLikeThis(object.representativeSegment.segmentId);
        } else {
            throw new Error("The specified object '" + object.objectId + "' does not have a most representative segment.");
        }
    }

    /**
     * Invoked when a user clicks the selection/favourie button. Toggles the selection mode of the SegmentScoreContainer.
     *
     * @param {MediaObjectScoreContainer} object
     */
    public onStarButtonClicked(object: MediaObjectScoreContainer) {
        object.representativeSegment.toggleMark();
    }

    /**
     * Invoked whenever a user clicks the Information button. Displays a SnackBar with the scores per feature category.
     *
     *
     * @param {MediaObjectScoreContainer} object
     */
    public onInformationButtonClicked(object: MediaObjectScoreContainer) {
        if (object.representativeSegment) {
            this._snackBar.openFromComponent(FeatureDetailsComponent, <MatSnackBarConfig>{data: object.representativeSegment, duration: 2500});
        } else {
            throw new Error("The specified object '" + object.objectId + "' does not have a most representative segment.");
        }
    }

    /**
     * This method is used internally to update the gallery view.
     */
    protected updateView() {
        if (this.results) {
            this._mediaobjects = this.results.objects;
            this._focus = null;
        } else {
            this._mediaobjects = [];
        }

        this._cdr.markForCheck();
    }
}