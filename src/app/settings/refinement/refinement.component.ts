import {Component, OnInit, OnDestroy} from '@angular/core';
import {MatCheckboxChange, MatSliderChange} from '@angular/material';
import {QueryChange, QueryService} from '../../core/queries/query.service';
import {WeightedFeatureCategory} from '../../shared/model/results/weighted-feature-category.model';
import {EMPTY, Observable} from 'rxjs';
import {EventBusService} from '../../core/basics/event-bus.service';
import {InteractionEventType} from '../../shared/model/events/interaction-event-type.model';
import {InteractionEvent} from '../../shared/model/events/interaction-event.model';
import {ContextKey, InteractionEventComponent} from '../../shared/model/events/interaction-event-component.model';
import {filter} from 'rxjs/operators';
import {FilterService} from '../../core/queries/filter.service';
import {ColorLabel} from '../../shared/model/misc/colorlabel.model';
import {MediaType} from '../../shared/model/media/media-type.model';

@Component({
    moduleId: module.id,
    selector: 'app-refinement',
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
    private _features: Observable<WeightedFeatureCategory[]> = EMPTY;

    /** Local reference to the subscription to the QueryService. */
    protected _queryServiceSubscription;

    /**
     * Constructor: Registers with the QueryService to be updated about changes
     * in the refinement.
     *
     * @param _queryService Reference to the QueryService singleton instance.
     * @param _filterService Reference to the FilterService singleton instance.
     * @param _eventBusService Reference to the EventBusService singleton instance.
     */
    constructor(private _queryService: QueryService, private _filterService: FilterService, private _eventBusService: EventBusService) {}

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit(): void {
        this._queryServiceSubscription = this._queryService.observable.pipe(
            filter(msg => {return ['STARTED', 'CLEAR'].indexOf(msg) > -1})
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
        if (msg == 'STARTED') {
            this._features = this._queryService.results.featuresAsObservable;
        } else if (msg == 'CLEAR'){
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
            const categories: Map<ContextKey, WeightedFeatureCategory[]> = new Map();
            categories.set('w:weights', results.features);
            this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.REFINE, categories)));
        });
    }


    /**
     * Triggered whenever the type filter selection changes. Reports the change to the FilterService,
     * which will update the filter settings accordingly.
     *
     * @param type
     * @param event
     */
    public onTypeFilterChanged(type: MediaType, event: MatCheckboxChange) {
        if (!this._queryService.results) return;
        this._filterService.mediatypes.set(type, event.checked);
        this._filterService.update();
        const context: Map<ContextKey, string> = new Map();
        context.set('f:type', 'mediaType');
        context.set('f:value', `${event.checked ? '+' : '-'}${type.toLowerCase()}`);
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER)));
    }

    /**
     * Triggered whenever the color filter selection changes. Reports the change to the FilterService,
     * which will update the filter settings accordingly.
     *
     * @param color
     * @param event
     */
    public onColorFilterChanged(color: ColorLabel, event: MatCheckboxChange) {
        if (!this._queryService.results) return;
        this._filterService.dominant.set(color, event.checked);
        this._filterService.update();
        const context: Map<ContextKey, string> = new Map();
        context.set('f:type', 'dominantColor');
        context.set('f:value', `${event.checked ? '+' : '-'}${color.toLowerCase()}`);
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER, context)));
    }

    /**
     *
     * @param event
     */
    public onThresholdValueChanges(event: MatSliderChange) {
        this._filterService.update();
        const context: Map<ContextKey, string> = new Map();
        context.set('f:type', 'scoreThreshold');
        context.set('f:value', `${event.value}`);
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER, context)));
    }

    /**
     *
     */
    get filter(): FilterService {
        return this._filterService;
    }

    /**
     * Getter for refinement array.
     *
     * @return {WeightedFeatureCategory[]}
     */
    get features(): Observable<WeightedFeatureCategory[]> {
        return this._features;
    }
}
