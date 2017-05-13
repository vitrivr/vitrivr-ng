import {Component, Inject} from "@angular/core";
import {MdDialogRef, MD_DIALOG_DATA} from "@angular/material";
import {EvaluationScenario} from "../shared/model/evaluation/evaluation-scenario";

@Component({
    moduleId: module.id,
    selector: 'scenario-dialog',
    template: `        
        <h2 md-dialog-title>Scenario: {{scenario.name}} (ID: {{scenario.id}})</h2>
        <hr class="fade"/>
        <md-dialog-content>
            <scenario-details [scenario]="scenario"></scenario-details>
        </md-dialog-content>
     `
})
export class ScenarioDetailsDialogComponent {
    /**
     *
     * @param _dialogRef
     * @param _scenario
     */
    constructor(public readonly _dialogRef: MdDialogRef<ScenarioDetailsDialogComponent>, @Inject(MD_DIALOG_DATA) private _scenario : EvaluationScenario) {
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
     * @return {MdDialogRef<ScenarioDetailsDialogComponent>}
     */
    get dialogRef(): MdDialogRef<ScenarioDetailsDialogComponent> {
        return this._dialogRef;
    }
}