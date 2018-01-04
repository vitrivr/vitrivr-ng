import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {AbstractResultsViewComponent} from "../abstract-results-view.component";
import {QueryService} from "../../core/queries/query.service";
import {ResolverService} from "../../core/basics/resolver.service";
import {Router} from "@angular/router";
import {MediaObjectScoreContainer} from "../../shared/model/features/scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../../shared/model/features/scores/segment-score-container.model";
import {FeatureDetailsComponent} from "../feature-details.component";
import {MatDialog, MatSnackBar, MatSnackBarConfig} from "@angular/material";
import {QuickViewerComponent} from "../../objectdetails/quick-viewer.component";
import {Observable} from "rxjs/Observable";
import {VbsSubmissionService} from "app/core/vbs/vbs-submission.service";
import {ConfigService} from "../../core/basics/config.service";

@Component({
    moduleId: module.id,
    selector: 'list',
    templateUrl: 'list.component.html',
    styleUrls: ['list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent extends AbstractResultsViewComponent{

    /** List of MediaObjectScoreContainers currently displayed by the list. */
    private _mediaobjects : MediaObjectScoreContainer[] = [];

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
     * Getter for list of MediaObjectScoreContainer
     *
     * @return {MediaObjectScoreContainer[]}
     */
    get mediaobjects(): MediaObjectScoreContainer[] {
        return this._mediaobjects;
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
            this._snackBar.open("Submitted segment '" + segment.segmentId + "' to VBS. Response: " + s.toString(),null, {duration: ConfigService.SNACKBAR_DURATION});
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
            this._mediaobjects = this.results.objects;
        } else {
            this._mediaobjects = [];
        }
        this._cdr.markForCheck();
    }
}