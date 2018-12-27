import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from "@angular/core";
import {AbstractResultsViewComponent} from "../abstract-results-view.component";
import {QueryService} from "../../core/queries/query.service";
import {ResolverService} from "../../core/basics/resolver.service";
import {Router} from "@angular/router";
import {MediaObjectScoreContainer} from "../../shared/model/results/scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../../shared/model/results/scores/segment-score-container.model";
import {MatDialog, MatSnackBar} from "@angular/material";
import {QuickViewerComponent} from "../../objectdetails/quick-viewer.component";
import {Observable} from "rxjs";
import {VbsSubmissionService} from "app/core/vbs/vbs-submission.service";
import {ResultsContainer} from "../../shared/model/results/scores/results-container.model";
import {SelectionService} from "../../core/selection/selection.service";
import {EventBusService} from "../../core/basics/event-bus.service";
import {InteractionEventType} from "../../shared/model/events/interaction-event-type.model";
import {InteractionEvent} from "../../shared/model/events/interaction-event.model";
import {ContextKey, InteractionEventComponent} from "../../shared/model/events/interaction-event-component.model";
import {map} from "rxjs/operators";
import {FilterService} from "../../core/queries/filter.service";

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

    /** The number of items that should be displayed. */
    protected _count: number = 100;

    /**
     * Default constructor.
     *
     * @param _cdr Reference to ChangeDetectorRef used to inform component about changes.
     * @param _queryService Reference to the singleton QueryService used to interact with the QueryBackend
     * @param _filterService
     * @param _selectionService Reference to the singleton SelectionService used for item highlighting.
     * @param _eventBusService Reference to the singleton EventBusService, used to listen to and emit application events.
     * @param _router The Router used for navigation
     * @param _snackBar The MatSnackBar component used to display the SnackBar.
     * @param _resolver
     * @param _dialog
     * @param _vbs
     */
    constructor(_cdr: ChangeDetectorRef,
                _queryService : QueryService,
                _filterService : FilterService,
                _selectionService: SelectionService,
                _eventBusService: EventBusService,
                 _router: Router,
                _snackBar: MatSnackBar,
                protected _resolver: ResolverService,
                protected _dialog: MatDialog,
                protected _vbs: VbsSubmissionService) {
        super(_cdr, _queryService, _filterService, _selectionService, _eventBusService, _router, _snackBar);
    }

    /**
     * Getter for the filters that should be applied to SegmentScoreContainer.
     */
    get objectFilter(): Observable<((v: MediaObjectScoreContainer) => boolean)[]> {
        return this._filterService.objectFilters;
    }

    /**
     * Getter for the filters that should be applied to SegmentScoreContainer.
     */
    get segmentFilter(): Observable<((v: SegmentScoreContainer) => boolean)[]> {
        return this._filterService.segmentFilter;
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
     * Invokes when a user clicks the 'Find neighbouring segments' button.
     *
     * @param {SegmentScoreContainer} segment
     */
    public onNeighborsButtonClicked(segment: SegmentScoreContainer) {
        this._queryService.findNeighboringSegments(segment.segmentId);
        let context: Map<ContextKey,any> = new Map();
        context.set("i:mediasegment", segment.segmentId);
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXPAND, context)));
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
        let context: Map<ContextKey,any> = new Map();
        context.set("i:mediasegment", segment.segmentId);
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXPAND, context)));
        event.preventDefault();
    }

    /**
     * Invoked when a user clicks the selection/favourie button. Toggles the selection mode of the SegmentScoreContainer.
     *
     * @param {SegmentScoreContainer} segment
     */
    public onSubmitButtonClicked(segment: SegmentScoreContainer) {
        this._vbs.submitSegment(segment);
    }

    /**
     * Invoked whenever a user clicks the actual tile; opens the QuickViewerComponent in a dialog.
     *
     * @param {MouseEvent} event
     * @param {SegmentScoreContainer} segment
     */
    public onTileClicked(event: MouseEvent, segment: SegmentScoreContainer) {
        if (event.shiftKey) {
            /* Shift-Click will trigger VBS submit. */
            this._vbs.submitSegment(segment);
        } else {
            /* Normal click will display item. */
            this._dialog.open(QuickViewerComponent, {data: segment});
            let context: Map<ContextKey, any> = new Map();
            context.set("i:mediasegment", segment.segmentId);
            this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXAMINE, context)))
        }
    }

    /**
     * Returns true, if the submit (to VBS) button should be displayed for the given segment and false otherwise. This depends on the configuration and
     * the media type of the object.
     *
     * @param {SegmentScoreContainer} segment The segment for which to determine whether the button should be displayed.
     * @return {boolean} True if submit button should be displayed, false otherwise.
     */
    public showVbsSubmitButton(segment: SegmentScoreContainer): Observable<boolean> {
        return this._vbs.isOn.pipe(map(v => v && segment.objectScoreContainer.mediatype == 'VIDEO'));
    }

    /**
     * This is a helper method to facilitate updating the the list correct. It is necessary due to nesting in the template (two NgFor). To determine, whether to update the view,
     * angular only takes the outer observable into account. As long as this observable doesn't change, there is now update. Doe to the hierarchical nature of the data, it is -
     * however - entirely possible that the outer observable is not changed while segments are being added to the container.
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
     * Increments the start value by the count value. Should be called by some kind of pagination control.
     */
    public incrementCount() {
        this._count += 100;
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.SCROLL)));
        this._cdr.markForCheck();
    }

    /**
     * Decrements the start value by the count value. Should be called by some kind of pagination control.
     */
    public decrementCount() {
        if (this._count - 100 >= 100) {
            this._count -= 100;
        } else {
            this._count = 100;
        }
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.SCROLL)));
        this._cdr.markForCheck();
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