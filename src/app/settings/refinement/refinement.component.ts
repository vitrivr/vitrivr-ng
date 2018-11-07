import {ChangeDetectorRef, Component, OnInit, OnDestroy, ChangeDetectionStrategy} from '@angular/core';
import {MatCheckboxChange, MatSliderChange} from "@angular/material";
import {QueryChange, QueryService} from "../../core/queries/query.service";
import {WeightedFeatureCategory} from "../../shared/model/results/weighted-feature-category.model";
import {MediaType, MediaTypes} from "../../shared/model/media/media-type.model";
import {EMPTY, Observable} from "rxjs";
import {EventBusService} from "../../core/basics/event-bus.service";
import {InteractionEventType} from "../../shared/model/events/interaction-event-type.model";
import {InteractionEvent} from "../../shared/model/events/interaction-event.model";
import {ContextKey, InteractionEventComponent} from "../../shared/model/events/interaction-event-component.model";
import {filter} from "rxjs/operators";
import {FilterService} from "../../core/queries/filter.service";
import {ColorLabel, ColorLabels} from "../../shared/model/misc/colorlabel.model";

@Component({
    moduleId: module.id,
    selector: 'refinement',
    templateUrl: './refinement.component.html',
    styleUrls: ['./refinement.component.css']
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

    /** An observable for the current results. */
    private _features : Observable<WeightedFeatureCategory[]> = EMPTY;

    /** Local reference to the subscription to the QueryService. */
    protected _queryServiceSubscription;

    /** List of media types for filtering. */
    public readonly mediatypes : MediaType[] = MediaTypes;

    /** List of media types for filtering. */
    public readonly colors: ColorLabel[] = ColorLabels;

    /**
     * Constructor: Registers with the QueryService to be updated about changes
     * in the refinement.
     *
     * @param _queryService Reference to the QueryService singleton instance.
     * @param _filterService Reference to the FilterService singleton instance.
     * @param _eventBusService Reference to the EventBusService singleton instance.
     */
    constructor(private _queryService : QueryService, private _filterService: FilterService, private _eventBusService: EventBusService) {}

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit(): void {
        this._queryServiceSubscription = this._queryService.observable.pipe(
            filter(msg => {return ["STARTED", "CLEAR"].indexOf(msg) > -1})
        ).subscribe((msg) => this.onQueryStartEnd(msg));
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
    public onQueryStartEnd(msg: QueryChange) {
        if (msg == "STARTED") {
            this._features = this._queryService.results.featuresAsObservable;
        } else if (msg == "CLEAR"){
            this._features = EMPTY;
        }
    }

    /**
     * Triggered whenever the value of one of the weight-sliders changes. Reports
     * the change to the QueryService, which will trigger a re-ranking of the results
     *
     * @param feature The feature that was changed.
     * @param event MatSliderChange event that contains the new value.
     */
    public onValueChanged(feature: WeightedFeatureCategory, event: MatSliderChange) {
        if (!this._queryService.results) return;

        /* Re-rank all objects asynchronously. */
        Promise.resolve(this._queryService.results).then((results)  => {
            feature.weight = event.value;
            this._queryService.results.rerank();

            /* Submit event to EventBus. */
            let categories: Map<ContextKey,WeightedFeatureCategory[]> = new Map();
            categories.set("w:weights",results.features);
            this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.REFINE, categories)));
        });
    }

    /**
     * Getter for refinement array.
     *
     * @return {WeightedFeatureCategory[]}
     */
    get features(): Observable<WeightedFeatureCategory[]> {
        return this._features;
    }

    /**
     * Triggered whenever the type filter selection changes. Reports the change to the FilterService,
     * which will update the filter settings accordingly.
     *
     * @param event
     */
    public onTypeFilterChanged(event: MatCheckboxChange) {
        if (!this._queryService.results) return;
        if (event.source.checked) {
            this._filterService.addMediaType(<MediaType>event.source.name);
        } else {
            this._filterService.removeMediaType(<MediaType>event.source.name);
        }
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER)));
    }

    /**
     * Triggered whenever the color filter selection changes. Reports the change to the FilterService,
     * which will update the filter settings accordingly.
     *
     * @param event
     */
    public onColorFilterChanged(event: MatCheckboxChange) {
        if (!this._queryService.results) return;
        if (event.source.checked) {
            this._filterService.addDominantColor(<ColorLabel>event.source.name);
        } else {
            this._filterService.removeDominantColor(<ColorLabel>event.source.name);
        }
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER)));
    }

    /**
     *
     * @param type
     */
    public isTypeActive(type: MediaType): boolean {
        return this._filterService.mediatypes.indexOf(type) > -1
    }

    /**
     *
     * @param type
     */
    public isColorActive(type: ColorLabel): boolean {
        return this._filterService.dominant.indexOf(type) > -1
    }
}