import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import {WeightedFeatureCategory} from '../shared/model/results/weighted-feature-category.model';
import {MediaSegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';

@Component({

  selector: 'app-feature-details',
  template: `
    <h3>{{title}}</h3>
    <div class="snackbar-feature" *ngFor="let line of lines">{{line}}</div>
  `,
  styles: ['.snackbar-feature { color: white; opacity: 0.65; font-size: 1.5em; padding: 5px; }']
})
export class FeatureDetailsComponent {

  /** The title string displayed by the FeatureDetailsComponent. */
  private readonly _title: string;

  /** The individual lines displayed by the FeatureDetailsComponent (one line per feature). */
  private _lines: string[] = [];

  /**
   * Default constructor; populates the array of texts.
   *
   * @param {Map<WeightedFeatureCategory, number>} data Data containing the results and associated scores.
   */
  constructor(@Inject(MAT_SNACK_BAR_DATA) data: MediaSegmentScoreContainer) {
    this._title = data.segmentId + ' (' + (data.score * 100).toFixed(2) + '%)';
    this._lines.push(`Score for obj (${data.objectScoreContainer.objectId}) : ${data.objectScoreContainer.scorePercentage}%`);
    data.scores.forEach((map, containerID) => {
      map.forEach((score, category) => {
        this._lines.push('(c:' + containerID + ').' + category.name + ': ' + Math.round(score * 1000) / 1000);
      });
    })
  }

  /**
   * Getter for title.
   *
   * @return {string}
   */
  get title(): string {
    return this._title;
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
