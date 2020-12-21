import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EvaluationScenario} from '../shared/model/evaluation/evaluation-scenario';

@Component({

  selector: 'app-scenario-dialog',
  template: `
      <h2 matDialogTitle>Scenario: {{scenario.name}} (ID: {{scenario.id}})</h2>
      <hr class="fade"/>
      <mat-dialog-content>
          <app-scenario-details [scenario]="scenario"></app-scenario-details>
      </mat-dialog-content>
  `
})
export class ScenarioDetailsDialogComponent {

  constructor(public readonly _dialogRef: MatDialogRef<ScenarioDetailsDialogComponent>, @Inject(MAT_DIALOG_DATA) private _scenario: EvaluationScenario) {
  }

  get scenario(): EvaluationScenario {
    return this._scenario;
  }
}
