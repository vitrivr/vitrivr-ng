import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {AbstractResultsViewComponent} from "../abstract-results-view.component";
import {QueryService} from "../../core/queries/query.service";
import {ResolverService} from "../../core/basics/resolver.service";
import {Router} from "@angular/router";
import {MediaObjectScoreContainer} from "../../shared/model/results/scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../../shared/model/results/scores/segment-score-container.model";
import {FeatureDetailsComponent} from "../feature-details.component";
import {MatDialog, MatSnackBar, MatSnackBarConfig} from "@angular/material";
import {QuickViewerComponent} from "../../objectdetails/quick-viewer.component";
import {Observable} from "rxjs/Observable";
import {VbsSubmissionService} from "app/core/vbs/vbs-submission.service";
import {ConfigService} from "../../core/basics/config.service";
import {ResultsContainer} from "../../shared/model/results/scores/results-container.model";
import {SelectionService} from "../../core/selection/selection.service";
import {Tag} from "../../core/selection/tag.model";

@Component({
    moduleId: module.id,
    selector: 'list',
    templateUrl: 'list.component.html',
    styleUrls: ['list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent extends AbstractResultsViewComponent<MediaObjectScoreContainer[]> {
    /** Reference to the SegmentScoreContainer that is currently in focus. */
    private _focus: SegmentScoreContainer;

    /**
     * Default constructor.
     *
     * @param _cdr Reference to ChangeDetectorRef used to inform component about changes.
     * @param _queryService
     * @param _selectionService
     * @param _resolver
     * @param _router
     * @param _snackBar
     * @param _dialog
     * @param _vbs
     */
    constructor(_cdr: ChangeDetectorRef,
                _queryService : QueryService,
                _selectionService: SelectionService,
                protected _resolver: ResolverService,
                protected _router: Router,
                protected _snackBar: MatSnackBar,
                protected _dialog: MatDialog,
                protected _vbs: VbsSubmissionService) {
        super(_cdr, _queryService, _selectionService);
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
     *
     * @param {SegmentScoreContainer} segment
     */
    public onInformationButtonClicked(segment: SegmentScoreContainer) {
        this._snackBar.openFromComponent(FeatureDetailsComponent, <MatSnackBarConfig>{data : segment, duration: 2500});
    }

    /**
     * Invokes when a user clicks the 'Find neighbouring segments' button.
     *
     * @param {SegmentScoreContainer} segment
     */
    public onNeighborsButtonClicked(segment: SegmentScoreContainer) {
        this._queryService.findNeighboringSegments(segment.segmentId);
    }

    /**
     * Invokes when a user right clicks the 'Find neighbouring segments' button. Loads neighbouring segments with
     * a count of 500.
     *
     * @param {Event} event
     * @param {SegmentScoreContainer} segment
     */
    public onNeighborsButtonRightClicked(event: Event, segment: SegmentScoreContainer) {
        this._queryService.findNeighboringSegments(segment.segmentId, 500);
        event.preventDefault();
    }

    /**
     * Invoked when a user clicks one of the 'Tag' buttons. Toggles the tag for the selected segment.
     *
     * @param {SegmentScoreContainer} segment The segment that was tagged.
     * @param {Tag} tag The tag that should be toggled.
     */
    public onTagButtonClicked(segment: SegmentScoreContainer, tag: Tag) {
        this._selectionService.toggle(segment.segmentId,tag);
        this._cdr.markForCheck();
    }

    /**
     * Invoked when a user right clicks one of the 'Tag' buttons. Toggles all tags for the selected objects.
     *
     * @param {Event} event
     * @param {SegmentScoreContainer} segment The segment that was tagged.
     * @param {Tag} tag The tag that should be toggled.
     */
    public onTagButtonRightClicked(event: Event, segment: SegmentScoreContainer, tag: Tag) {
        for (let s of segment.objectScoreContainer.segments) {
            this._selectionService.toggle(s.segmentId,tag);
        }
        this._cdr.markForCheck();
        event.preventDefault();
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
     * This is a helper method to facilitate updating the the list correct. It is necessary due to nesting in the template (twp NgFor). To determine, whether to update the view,
     * angular only takes the outer observable into account. As long as this observable doesn't change, there is now update. Doe to the hierarchical nature of the data, it is - however -
     * entirely possible that the outer observable is not changed while segments are being added to the container.
     *
     * This function created a unique identifier per MediaObjectScoreContainer which takes the number of segments into account.
     *
     * @param index
     * @param {MediaObjectScoreContainer} item
     */
    public trackByFunction(index, item: MediaObjectScoreContainer) {
        return item.objectId + "_" + item.numberOfSegments;
    }

    /**
     * Subscribes to the data exposed by the ResultsContainer.
     *
     * @return {Observable<MediaObjectScoreContainer>}
     */
    protected subscribe(results: ResultsContainer) {
        if (results) {
            this._dataSource = results.mediaobjectsAsObservable;
        }
    }
}