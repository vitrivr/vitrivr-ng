import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material';
import {SegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';

/**
 * Popup for metadata details associated to segment
 */
@Component({
    moduleId: module.id,
    selector: 'metadata-details',
    template: `
        <h3>{{title}}</h3>
        <div class="snackbar-feature" *ngFor="let line of lines">{{line}}</div>
    `,
    styles: ['.snackbar-feature { color: white; opacity: 0.65; font-size: 1.5em; padding: 5px; }']
})
export class MetadataDetailsComponent {

    /** The title string displayed. */
    private _title: string;

    /** The individual lines displayed (one line per metadata value). */
    private _lines: string[] = [];


    /**
     * Default constructor; populates the array of texts.
     */
    constructor(@Inject(MAT_SNACK_BAR_DATA) data: SegmentScoreContainer) {
        this._title = 'Metadata for ' + data.segmentId;
        data.metadata.forEach((value, key) => {
            this._lines.push(key + ': ' + value)
        });
        if (data.metadata.size === 0) {
            this._lines.push('No Metadata available')
        }
    }

    /**
     * Getter for lines array.
     *
     * @return {string[]}
     */
    get lines(): string[] {
        return this._lines;
    }

    /**
     * Getter for title.
     *
     * @return {string}
     */
    get title(): string {
        return this._title;
    }
}
