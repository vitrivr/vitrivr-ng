import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from "@angular/core";
import {AbstractResultsViewComponent} from "../abstract-results-view.component";
import {MediaObjectScoreContainer} from "../../shared/model/features/scores/media-object-score-container.model";
import {QueryService} from "../../core/queries/query.service";
import {ResolverService} from "../../core/basics/resolver.service";
import {Router} from "@angular/router";
import {SegmentScoreContainer} from "../../shared/model/features/scores/segment-score-container.model";
import {MdDialog, MdSnackBar, MdSnackBarConfig} from "@angular/material";
import {FeatureDetailsComponent} from "../feature-details.component";
import {QuickViewerComponent} from "../../objectdetails/quick-viewer.component";

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
     */
    constructor(_cdr: ChangeDetectorRef, _queryService : QueryService, protected _resolver: ResolverService, protected _router: Router, protected _snackBar: MdSnackBar, protected _dialog: MdDialog) {
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
     *
     * @param {SegmentScoreContainer} segment
     */
    public onInformationButtonClicked(segment: SegmentScoreContainer) {
        this._snackBar.openFromComponent(FeatureDetailsComponent, <MdSnackBarConfig>{data : segment.scores, duration: 2500});
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