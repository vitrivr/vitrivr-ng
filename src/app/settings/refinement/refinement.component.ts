import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {MatSliderChange} from '@angular/material/slider';
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
import {AbstractRefinementOption} from './refinementoption.model';
import {CheckboxRefinementModel} from './checkboxrefinement.model';
import {SliderRefinementModel} from './sliderrefinement.model';
import {FilterType} from './filtertype.model';
import {SelectionService} from '../../core/selection/selection.service';
import {Tag} from '../../core/selection/tag.model';
import {AppConfig} from '../../app.config';
import {MediaObjectDescriptor} from '../../../../openapi/cineast/model/mediaObjectDescriptor';

@Component({
  selector: 'app-refinement',
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

  /** Local reference to the subscription to the QueryService. */
  protected _queryServiceSubscription;
  private filtersEnabled: Map<string, boolean> = new Map<string, boolean>();

  /** An observable for the current results. */
  _features: Observable<WeightedFeatureCategory[]> = EMPTY;

  /** An observable for all possible metadatavalues */
  _metadata: Observable<Map<string, AbstractRefinementOption>>;

  mdFilterOn = []

  private _timer;

  private _idFilterValue: string;

  constructor(private _queryService: QueryService,
              public _filterService: FilterService,
              private _eventBusService: EventBusService,
              private _configService: AppConfig,
              public _selectionService: SelectionService,
              private _cdr: ChangeDetectorRef) {
  }

  /**
   * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
   */
  public ngOnInit(): void {
    this._queryServiceSubscription = this._queryService.observable.pipe(
      filter(msg => {
        return ['STARTED', 'CLEAR'].indexOf(msg) > -1
      })
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
    if (msg === 'STARTED') {
      this._features = this._queryService.results.featuresAsObservable;
      this._features.forEach(() => this._cdr.markForCheck());
      this._metadata = this._queryService.results.metadataAsObservable(this._configService);
      this._metadata.forEach(() => this._cdr.markForCheck());
    } else if (msg === 'CLEAR') {
      this._features = EMPTY;
      this._metadata = EMPTY;
    }
  }

  /**
   * Triggered whenever the value of one of the weightPercentage-sliders changes. Reports
   * the change to the QueryService, which will trigger a re-ranking of the results
   *
   * @param feature The feature that was changed.
   * @param event MatSliderChange event that contains the new value.
   */
  public onValueChanged(feature: WeightedFeatureCategory, event: MatSliderChange) {
    if (!this._queryService.results) {
      console.warn('no results in queryService, ignoring change');
      return;
    }

    /* Re-rank all objects asynchronously. */
    Promise.resolve(this._queryService.results).then((results) => {
      feature.weightPercentage = event.value;
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
   */
  public onTypeFilterChanged(type: MediaObjectDescriptor.MediatypeEnum, event: MatCheckboxChange) {
    if (!this._queryService.results) {
      return;
    }
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
    if (!this._queryService.results) {
      return;
    }
    this._filterService.dominant.set(color, event.checked);
    this._filterService.update();
    const context: Map<ContextKey, string> = new Map();
    context.set('f:type', 'dominantColor');
    context.set('f:value', `${event.checked ? '+' : '-'}${color.toLowerCase()}`);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER, context)));
  }

  public onMetadataFilterChanged(category: string, key: string, event: MatCheckboxChange) {
    if (!this._queryService.results) {
      return;
    }
    if (this._filterService.filterMetadata.has(category)) {
      if (event.checked) {
        this._filterService.filterMetadata.get(category).add(key)
      } else {
        this._filterService.filterMetadata.get(category).delete(key);
        if (this._filterService.filterMetadata.get(category).size === 0) {
          this._filterService.filterMetadata.delete(category);
        }
      }
    } else {
      if (event.checked) {
        this._filterService.filterMetadata.set(category, new Set<string>().add(key))
      }
    }
    this._filterService.update();
    const context: Map<ContextKey, string> = new Map();
    context.set('f:type', 'metadata');
    context.set('f:value', `${event.checked ? '+' : '-'}${category.toLowerCase()}:${key.toLowerCase()}`);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER)));
  }

  public resetFilters() {
    this._filterService.clear()
  }

  public mdFilterChecked(category, value): boolean {
    return this._filterService.filterMetadata.has(category) ? (this._filterService.filterMetadata.get(category).has(value)) : false
  }

  public mdShowFilterCategory(category): boolean {
    return this.filtersEnabled.has(category) ? this.filtersEnabled.get(category) : true
  }

  public onFilterCategoryToggle(category, event: MatSlideToggleChange) {
    this.filtersEnabled.set(category, event.checked);
    this._filterService.filterRangeMetadata.delete(category);
    this._filterService.filterMetadata.delete(category);
    this._filterService.update();

    const context: Map<ContextKey, string> = new Map();
    context.set('f:type', 'filterCategory');
    context.set('f:value', `${event.checked ? '+' : '-'}${category}`);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER)));
  }

  public set idFilterValue(id: string) {
    this._idFilterValue = id
    this._filterService._filters.id = id;
    this._filterService.update();
    const context: Map<ContextKey, string> = new Map();
    context.set('f:type', 'id');
    context.set('f:value', `${id}`);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER)));
  }

  public onMdCatOperatorChange(event: MatSlideToggleChange) {
    this._filterService._filters.useOrForMetadataCategoriesFilter = event.checked;
    this._filterService.update();
    const context: Map<ContextKey, string> = new Map();
    context.set('f:type', 'metadata_categoryfilter');
    context.set('f:value', `${event.checked}`);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER)));
  }

  public onThresholdValueChanges(event: MatSliderChange) {
    this._filterService.update();
    const context: Map<ContextKey, string> = new Map();
    context.set('f:type', 'scoreThreshold');
    context.set('f:value', `${event.value}`);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER, context)));
  }

  isCheckbox(value: AbstractRefinementOption): boolean {
    return value.type === FilterType.CHECKBOX
  }

  isSlider(value: AbstractRefinementOption): boolean {
    return value.type === FilterType.SLIDER
  }

  sliderObject(value: AbstractRefinementOption): SliderRefinementModel {
    return (value as SliderRefinementModel)
  }

  checkboxOptions(value: AbstractRefinementOption): Set<string> {
    return (value as CheckboxRefinementModel).options
  }

  minValue(key: string, min: number) {
    const prev = this._filterService.filterRangeMetadata.get(key);
    if (prev) {
      this._filterService.filterRangeMetadata.set(key, [min, prev[1]]);
    } else {
      this._filterService.filterRangeMetadata.set(key, [min, null]);
    }
    this.update();
    const context: Map<ContextKey, string> = new Map();
    context.set('f:type', 'metadata:min');
    context.set('f:value', `${key}'-'}${min}`);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER)));
  }


  min(key: string): string {
    if (this._filterService.filterRangeMetadata.get(key)) {
      if (this._filterService.filterRangeMetadata.get(key)[0]) {
        return this._filterService.filterRangeMetadata.get(key)[0].toString();
      }
    }
    return '';
  }

  max(key: string): string {
    if (this._filterService.filterRangeMetadata.get(key)) {
      if (this._filterService.filterRangeMetadata.get(key)[1]) {
        return this._filterService.filterRangeMetadata.get(key)[1].toString();
      }
    }
    return '';
  }

  update() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._filterService.update();
    }, 100);
  }

  maxValue(key: string, max: number) {
    const prev = this._filterService.filterRangeMetadata.get(key);
    if (prev) {
      this._filterService.filterRangeMetadata.set(key, [prev[0], max]);
    } else {
      this._filterService.filterRangeMetadata.set(key, [null, max]);
    }
    this.update();
    const context: Map<ContextKey, string> = new Map();
    context.set('f:type', 'metadata:max');
    context.set('f:value', `${key}'-'}${max}`);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER)));
  }

  onTagFilterChanged(tag: Tag, $event: MatCheckboxChange) {
    if ($event.checked) {
      this._filterService.filterTags.add(tag);
    } else {
      this._filterService.filterTags.delete(tag)
    }
    this._filterService.update();
    const context: Map<ContextKey, string> = new Map();
    context.set('f:type', 'tagfilter');
    context.set('f:value', `${tag.name}':'}${$event.checked}`);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.FILTER)));
  }

}


