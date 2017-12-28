import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from "@angular/core";
import {AbstractResultsViewComponent} from "../abstract-results-view.component";
import {MediaObjectScoreContainer} from "../../shared/model/features/scores/media-object-score-container.model";
import {QueryService} from "../../core/queries/query.service";
import {ResolverService} from "../../core/basics/resolver.service";
import {Router} from "@angular/router";
import {SegmentScoreContainer} from "../../shared/model/features/scores/segment-score-container.model";
import {MatDialog, MatSnackBar, MatSnackBarConfig} from "@angular/material";
import {FeatureDetailsComponent} from "../feature-details.component";
import {QuickViewerComponent} from "../../objectdetails/quick-viewer.component";
import {MediaSegmentDragContainer} from "../../shared/model/internal/media-segment-drag-container.model";
import {MediaObjectDragContainer} from "../../shared/model/internal/media-object-drag-container.model";
import {VbsSubmissionService} from "../../core/vbs/vbs-submission.service";
import {Observable} from "rxjs/Observable";

@Component({
    moduleId: module.id,
    selector: 'mini-gallery',
    templateUrl: 'mini-gallery.component.html',
    styleUrls: ['mini-gallery.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiniGalleryComponent extends AbstractResultsViewComponent{
    /** List of MediaObjectScoreContainers currently displayed by the gallery. */
    protected _segments : SegmentScoreContainer[] = [];

    /** Reference to the SegmentScoreContainer that is currently in focus. */
    private _focus: SegmentScoreContainer;

    /**
     * Default constructor.
     *
     * @param _cdr Reference to ChangeDetectorRef used to inform component about changes.
     * @param _queryService
     * @param _resolver
     * @param _router
     * @param _snackBar
     * @param _dialog
     * @param _vbs
     */
    constructor(_cdr: ChangeDetectorRef,
                _queryService : QueryService,
                protected _resolver: ResolverService,
                protected _router: Router,
                protected _snackBar: MatSnackBar,
                protected _dialog: MatDialog,
                protected _vbs: VbsSubmissionService) {
        super(_cdr, _queryService);
    }

    /**
     *
     * @return {MediaObjectScoreContainer[]}
     */
    get segments(): SegmentScoreContainer[] {
        return this._segments;
    }

    /**
     * Sets the focus to the provided SegmentScoreContainer.
     *
     * @param focus
     */
    set focus(focus: SegmentScoreContainer) {
        this._focus = focus;
    }

    /**
     * Returns true, if the provided SegmentScoreContainer is currently in focus and false otherwise.
     *
     * @param segment SegmentScoreContainer that should be checked.
     * @return {boolean}
     */
    public inFocus(segment: SegmentScoreContainer) {
        return this._focus == segment;
    }

    /**
     * Invoked whenever a user clicks on the object details button. Triggers a transition to the ObjectdetailsComponent.
     *
     * @param segment SegmentScoreContainer for which details should be displayed.
     */
    public onDetailsButtonClicked(segment: SegmentScoreContainer) {
        this._router.navigate(['/mediaobject/' + segment.objectId]);
    }

    /**
     * Invoked whenever a user clicks on the MLT (= MoreLikeThis) button. Triggers a MLT query with the QueryService.
     *
     * @param segment SegmentScoreContainer which should be used for MLT.
     */
    public onMltButtonClicked(segment: SegmentScoreContainer) {
        this._queryService.findMoreLikeThis(segment.segmentId);
    }

    /**
     * Invoked whenever a user clicks the Information button. Displays a SnackBar with the scores per feature category.
     *
     * @param {SegmentScoreContainer} segment
     */
    public onInformationButtonClicked(segment: SegmentScoreContainer) {
        this._snackBar.openFromComponent(FeatureDetailsComponent, <MatSnackBarConfig>{data : segment, duration: 2500});
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
     * Invoked when a user clicks the selection/favourie button. Toggles the selection mode of the SegmentScoreContainer.
     *
     * @param {SegmentScoreContainer} segment
     */
    public onSubmitButtonClicked(segment: SegmentScoreContainer) {
        this._vbs.submitSegment(segment).catch((e,o) => {
            this._snackBar.open("Failed to submit segment '" + segment.segmentId + "' to VBS due to an error: " + e.message);
            console.log(e);
            return Observable.empty();
        }).subscribe(s => {
            this._snackBar.open("Successfully submitted segment '" + segment.segmentId + "' to VBS.");
        });
    }

    /**
     * Invoked whenever a user clicks the actual tile; opens the QuickViewerComponent in a dialog.
     *
     * @param {SegmentScoreContainer} segment
     */
    public onTileClicked(segment: SegmentScoreContainer) {
        let dialogRef = this._dialog.open(QuickViewerComponent, {data: segment});
    }

    /**
     * Whenever a tile is dragged the associated segment and the media object that tile represents is converted to
     * JSON and added to the dataTransfer object of the drag event.
     *
     * @param event Drag event
     * @param segment SegmentScoreContainer that is being dragged.
     */
    public onTileDrag(event, segment: SegmentScoreContainer) {
        event.dataTransfer.setData(MediaSegmentDragContainer.FORMAT, MediaSegmentDragContainer.fromScoreContainer(segment).toJSON());
        event.dataTransfer.setData(MediaObjectDragContainer.FORMAT, MediaObjectDragContainer.fromScoreContainer(segment.objectScoreContainer).toJSON());
    }
    
    /**
     * Returns true, if the submit (to VBS) button should be displayed for the given segmentand false otherwise. This depends on the configuration and
     * the media type of the object.
     *
     * @param {SegmentScoreContainer} segment The segment for which to determine whether the button should be displayed.
     * @return {boolean} True if submit button should be displayed, false otherwise.
     */
    public showsubmit(segment: SegmentScoreContainer): boolean {
        return segment.objectScoreContainer.mediatype == 'VIDEO' && this._vbs.isOn;
    }

    /**
     * This method is used internally to update the gallery view.
     */
    protected updateView() {
        if (this.results) {
            this._segments = this.results.segments;
            this._focus = null;
        } else {
            this._segments = [];
        }

        this._cdr.markForCheck();
    }
}