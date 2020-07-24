import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {EvaluationScenario} from '../shared/model/evaluation/evaluation-scenario';

@Component({

  selector: 'scenario-dialog',
  template: `        
        <h2 matDialogTitle>Scenario: {{scenario.name}} (ID: {{scenario.id}})</h2>
        <hr class="fade"/>
        <mat-dialog-content>
            <scenario-details [scenario]="scenario"></scenario-details>
        </mat-dialog-content>
     `
})
export class ScenarioDetailsDialogComponent {
  /**
   *
   * @param _dialogRef
   * @param _scenario
   */
  constructor(public readonly _dialogRef: MatDialogRef<ScenarioDetailsDialogComponent>, @Inject(MAT_DIALOG_DATA) private _scenario: EvaluationScenario) {
  }

  /**
   * Getter for scenario.
   *
   * @return {EvaluationScenario}
   */
  get scenario(): EvaluationScenario {
    return this._scenario;
  }

  /**
   * Getter for dialog-ref.
   *
   * @return {MatDialogRef<ScenarioDetailsDialogComponent>}
   */
  get dialogRef(): MatDialogRef<ScenarioDetailsDialogComponent> {
    return this._dialogRef;
  }
}
