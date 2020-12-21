import {Component, Input} from '@angular/core';
import {Evaluation} from '../shared/model/evaluation/evaluation';

@Component({

  selector: 'app-evaluation-history',
  template: `
        <div>
            <dl>
                <dt>Begin</dt>
                <dd>{{evaluation.begin}}</dd>
                <dt>End</dt>
                <dd>{{evaluation.end}}</dd>
            </dl>
        </div>
        <div>
            <table>
                <thead>
                    <th>#</th>
                    <th>Object ID</th>
                    <th>Segment ID</th>
                    <th>Score (Vitrivr)</th>
                    <th>Rating</th>
                </thead>

                <tbody>
                    <tr *ngFor="let rating of evaluation.ratings">
                        <td>{{rating.rank + 1}}</td>
                        <td>{{rating.objectId}}</td>
                        <td>{{rating.segmentId}}</td>
                        <td>{{rating.relevance.toFixed(2)}}</td>
                        <td>{{rating.rating}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
})
export class EvaluationHistory {
  @Input('evaluation')
  private _evaluation: Evaluation;

  /**
   * Getter for evaluation.
   *
   * @return {Evaluation}
   */
  get evaluation() {
    return this._evaluation;
  }
}
