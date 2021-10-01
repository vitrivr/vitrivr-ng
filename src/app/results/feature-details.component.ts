import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import {WeightedFeatureCategory} from '../shared/model/results/weighted-feature-category.model';
import {MediaSegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';
import {TemporalObjectSegments} from '../shared/model/misc/temporalObjectSegments';

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
   * Expects an array with the first element being segment info, and the second element possibly containing info about the temporal sequence the segment is associated with.
   */
  constructor(@Inject(MAT_SNACK_BAR_DATA) data: any[]) {
    const segment: MediaSegmentScoreContainer = data[0]
    let temporalObject: TemporalObjectSegments = undefined
    if (data.length > 1) {
      temporalObject = data[1] as TemporalObjectSegments
    }
    this._title = segment.segmentId + ' (' + (segment.score * 100).toFixed(2) + '%)';
    if (temporalObject) {
      this._lines.push(`Score for path: ${temporalObject.score}`)
      this._lines.push(`Path: ${temporalObject.segments[0].segmentId} - ${temporalObject.segments[temporalObject.segments.length - 1].segmentId}`)
    }
    this._lines.push(`Score for obj (${segment.objectScoreContainer.objectId}) : ${segment.objectScoreContainer.scorePercentage}%`);
    segment.scores.forEach((map, containerID) => {
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
