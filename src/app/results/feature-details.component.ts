import {Component, Inject} from "@angular/core";
import {MD_SNACK_BAR_DATA} from "@angular/material";
import {Feature} from "../shared/model/features/feature.model";

@Component({
    moduleId: module.id,
    selector: 'feature-details',
    template: `<div class="snackbar-feature" *ngFor="let line of lines">{{line}}</div>`,
    styles: ['.snackbar-feature { background-color: rgb(0,0,0); color: white; opacity: 0.65; font-size: 1.5em; padding: 5px; }']
})
export class FeatureDetailsComponent{

    /** */
    private _lines: string[] = [];


    /**
     * Default constructor; populates the array of texts.
     *
     * @param {Map<Feature, number>} data Data containing the features and associated scores.
     */
    constructor(@Inject(MD_SNACK_BAR_DATA) data: Map<Feature,number>) {
        data.forEach((value, key) => {this._lines.push(key.name + ": " + Math.round(value * 1000) / 1000);})
    }

    /**
     * Getter for lines array.
     *
     * @return {string[]}
     */
    get lines(): string[] {
        return this._lines;
    }
}