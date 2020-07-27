import {Component, Input} from '@angular/core';
import {WeightedFeatureCategory} from '../../shared/model/results/weighted-feature-category.model';

@Component({

  selector: 'weight-distribution',
  template: `
    <div class="weight-distribution">
      <div *ngFor="let feature of features" [style.width]="getWidth(feature)" [style.height]="'10px'"
           [style.background-color]="feature.displayColor"></div>
    </div>
  `

})

/**
 * This component gives a visual representation of the content.
 */
export class WeightDistributionComponent {
  /**
   * List of refinement that are currently displayed.
   *
   * @type {Map<any, any>}
   */
  @Input() features: WeightedFeatureCategory[] = [];

  /**
   * Returns the total weightPercentage of all refinement currently known
   * to the component.
   *
   * @returns {number} Total weightPercentage of all refinement.
   */
  public getTotal(): number {
    return this.features
      .map(f => f.weightPercentage)
      .reduce((a, b) => a + b);
  }

  /**
   * Returns the width (in percent) of an individual feature.
   *
   * @param feature Feature for which the widht should be calculated.
   * @returns {number} Width in percent.
   */
  public getWidth(feature: WeightedFeatureCategory) {
    return (feature.weightPercentage / this.getTotal()) + '%';
  }
}
