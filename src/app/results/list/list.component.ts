import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {AbstractResultsViewComponent} from "../abstract-results-view.component";
import {QueryService} from "../../core/queries/query.service";
import {ResolverService} from "../../core/basics/resolver.service";
import {Router} from "@angular/router";
import {MediaObjectScoreContainer} from "../../shared/model/features/scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../../shared/model/features/scores/segment-score-container.model";
import {FeatureDetailsComponent} from "../feature-details.component";
import {MdSnackBar, MdSnackBarConfig} from "@angular/material";

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
     */
    constructor(_cdr: ChangeDetectorRef, _queryService : QueryService, protected _resolver: ResolverService, protected _router: Router, private _snackBar: MdSnackBar) {
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
        this._snackBar.openFromComponent(FeatureDetailsComponent, <MdSnackBarConfig>{data : segment.scores, duration: 2500});
    }

    /**
     * This method is used internally to update the gallery view.
     */
    protected updateView() {
        if (this.results) {
            this._mediaobjects = this.results.objects.slice().sort((a,b) => MediaObjectScoreContainer.compareAsc(a,b));
        } else {
            this._mediaobjects = [];
        }

        this._cdr.markForCheck();
    }
}