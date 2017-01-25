import {Component, Input} from "@angular/core";
import {Feature} from "../shared/model/features/feature.model";
@Component({
    moduleId: module.id,
    selector: 'weight-distribution',
    template: `
        <h4>Weight distribution</h4>
        <div class="weight-distribution">
            <div *ngFor="let feature of features" [style.width]="getWidth(feature)" [style.height]="'10px'" [style.background-color]="feature.color"></div>
        </div>   
    `
    
})

/**
 * This component gives a visual representation of the content.
 */
export class WeightDistributionComponent {
    /**
     * List of features that are currently displayed.
     *
     * @type {Map<any, any>}
     */
    @Input() features: Feature[] = [];

    /**
     * Returns the total weight of all features currently known
     * to the component.
     *
     * @returns {number} Total weight of all features.
     */
    public getTotal(): number {
        return this.features
            .map(f => f.weight)
            .reduce((a,b) => a+b);
    }

    /**
     * Returns the width (in percent) of an individual feature.
     *
     * @param feature Feature for which the widht should be calculated.
     * @returns {number} Width in percent.
     */
    public getWidth(feature: Feature) {
       return (feature.weight/this.getTotal()) * 100 + '%';
    }
}