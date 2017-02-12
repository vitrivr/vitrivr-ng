import {Component} from '@angular/core';
import {MdSliderChange} from "@angular/material";
import {QueryService} from "../core/queries/queries.service";

import {Feature} from "../shared/model/features/feature.model";

@Component({
    moduleId: module.id,
    selector: 'features',
    template: ` 
        <h3>Features and weights</h3>
        <div *ngIf="features.length > 0">
            <div *ngFor="let feature of features" class="slider-group" [style.color]="feature.color">
                <span class="label">{{feature.name}}</span>
                <md-slider min="0" max="100" value="{{feature.weight}}" (change)="onValueChanged(feature, $event)"></md-slider>
                <span class="label"> {{feature.weight}}%</span>
            </div>
            <weight-distribution *ngIf="features.length > 0" [features]="features"></weight-distribution>
        </div>
        <div *ngIf="features.length == 0">
            <p class="text-muted">No features available. Execute a query first or wait for incoming results.</p>
        </div>
    `
})

/**
 * Component that displays all the relevant features for the Query that is currently
 * active in the QueryService. The component allows the user to change the features
 * on the individual features so as to re-rank the results.
 */
export class FeaturesComponent {

    /**
     * List of features that are currently displayed.
     *
     * @type {Map<any, any>}
     */
    private features: Feature[] = [];

    /**
     * Constructor: Registers with the QueryService to be updated about changes
     * in the features.
     *
     * @param _queryService Reference to the QueryService instance.
     */
    constructor(private _queryService : QueryService) {
        this._queryService.observable()
            .filter(msg => (msg == "FEATURE"))
            .subscribe((msg) => this.onQueryStateChange());
    }

    /**
     * Invoked whenever the QueryService reports that the features were changed. Causes the
     * features array to be updated and the view to be changed.
     */
    private onQueryStateChange() {
        this.features = this._queryService.getFeatures();
    }

    /**
     * Triggered whenever the value of one of the weight-sliders changes. Reports
     * the change to the QueryService, which will trigger a re-raking of the results
     *
     * @param feature The feature that was changed.
     * @param event MdSliderChange event that contains the new value.
     */
    private onValueChanged(feature: Feature, event: MdSliderChange) {
        feature.weight = event.value;
        this._queryService.rerank();
    }
}