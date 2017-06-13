import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy} from '@angular/core';
import {MdCheckboxChange, MdSliderChange} from "@angular/material";
import {QueryService} from "../core/queries/query.service";
import {Feature} from "../shared/model/features/feature.model";
import {MediaType} from "../shared/model/media/media-type.model";

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

    /** List of available MediaTypes as reported by the QueryService. */
    private _mediatypes: MediaType[] = [];

    /** List of features as reported by the QueryService. */
    private _features: Feature[] = [];

    /** Local reference to the subscription to the QueryService. */
    protected _queryServiceSubscription;

    /**
     * Constructor: Registers with the QueryService to be updated about changes
     * in the refinement.
     *
     * @param _queryService Reference to the QueryService instance.
     */
    constructor(private _cdr: ChangeDetectorRef, private _queryService : QueryService) {

    }

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit(): void {
        this._queryServiceSubscription = this._queryService.observable
            .filter(msg => (["FEATURE", "UPDATE", "CLEAR"].indexOf(msg) > -1))
            .subscribe((msg) => this.onQueryStateChange());
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
    public onQueryStateChange() {
        /* Re-assign the refinement array. */
        this._features = this._queryService.features;

        /* Reset the MediaTypes array. */
        this._mediatypes = [];
        this._queryService.mediatypes.forEach((value,key) => {
            if (this._mediatypes.indexOf(key) == -1) this._mediatypes.push(key);
        });

        /* Mark for check. */
        this._cdr.markForCheck();
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
        this._queryService.rerank();
        this._cdr.markForCheck();
    }

    /**
     * Triggered whenever the filter selection changes. Reports the change to the
     * QueryService, which will update the filter settings accordingly.
     *
     * @param event
     */
    public onFilterChanged(event: MdCheckboxChange) {
        this._queryService.toggleMediatype(<MediaType>event.source.name, event.source.checked);
    }

    /**
     *
     * @param mediatype
     */
    public isActive(mediatype : MediaType) : boolean {
        if (this._queryService.has(mediatype)) {
            return this._queryService.mediatypes.get(mediatype);
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
        return this._mediatypes;
    }

    /**
     * Getter for refinement array.
     *
     * @return {Feature[]}
     */
    get features(): Feature[] {
        return this._features;
    }
}