import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy} from '@angular/core';
import {MdCheckboxChange, MdSliderChange} from "@angular/material";
import {QueryChange, QueryService} from "../core/queries/query.service";
import {Feature} from "../shared/model/features/feature.model";
import {MediaType} from "../shared/model/media/media-type.model";
import {ResultsContainer} from "../shared/model/features/scores/results-container.model";

@Component({
    moduleId: module.id,
    selector: 'refinement',
    templateUrl: './refinement.component.html',
    styleUrls: ['./refinement.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * Component that can be used to refine an already executed query. Refinement options currently include
 * two actions:
 * - Filter results based on the MediaType
 * - Adjust weights per feature categories.
 *
 * The component allows the user to changes these settings and update the QueryService accordingly.
 */
export class RefinementComponent implements OnInit, OnDestroy {

    /** The container pointing to the currently active results. */
    private _results :ResultsContainer;

    /** Local reference to the subscription to the QueryService. */
    protected _queryServiceSubscription;

    /**
     * Constructor: Registers with the QueryService to be updated about changes
     * in the refinement.
     *
     * @param _cdr Reference to the ChangeDetector (Angular JS)
     * @param _queryService Reference to the QueryService instance.
     */
    constructor(private _cdr: ChangeDetectorRef, private _queryService : QueryService) {}

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit(): void {
        this._queryServiceSubscription = this._queryService.observable
            .filter(msg => {return ["STARTED", "CLEAR"].indexOf(msg) > -1})
            .subscribe((msg) => this.onQueryStart());
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the QueryService subscription.
     */
    public ngOnDestroy(): void {
        this._queryServiceSubscription.unsubscribe();
        this._queryServiceSubscription = null;
    }

    /**
     * Invoked whenever the QueryService reports that the refinement were changed. Causes the
     * refinement array to be updated and the view to be changed.
     */
    public onQueryStart() {
        this._results = this._queryService.results;
        this._cdr.markForCheck();
        if (this._results) {
            this._results.subscribe(() => {
                this._cdr.markForCheck()
            });
        }
    }

    /**
     * Triggered whenever the filter selection changes. Reports the change to the
     * QueryService, which will update the filter settings accordingly.
     *
     * @param event
     */
    public onFilterChanged(event: MdCheckboxChange) {
        if (this._results) {
            this._results.toggleMediatype(<MediaType>event.source.name, event.source.checked);
        }
    }

    /**
     * Triggered whenever the value of one of the weight-sliders changes. Reports
     * the change to the QueryService, which will trigger a re-ranking of the results
     *
     * @param feature The feature that was changed.
     * @param event MdSliderChange event that contains the new value.
     */
    public onValueChanged(feature: Feature, event: MdSliderChange) {
        feature.weight = event.value;
        if (this._results) {
            this._results.rerank();
        }
    }

    /**
     *
     * @param mediatype
     */
    public isActive(mediatype : MediaType) : boolean {
        if (this._results && this._results.mediatypes.has(mediatype)) {
            return this._results.mediatypes.get(mediatype);
        } else {
            return false;
        }
    }

    /**
     * Getter for media types array.
     *
     * @return {MediaType[]}
     */
    get mediatypes(): MediaType[] {
        if (this._results) {
            return Array.from(this._results.mediatypes.keys());
        } else {
            return [];
        }
    }

    /**
     * Getter for refinement array.
     *
     * @return {Feature[]}
     */
    get features(): Feature[] {
        if (this._results) {
            return this._results.features;
        } else {
            return [];
        }
   }
}