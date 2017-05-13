import {Component} from "@angular/core";
import {MdDialogRef} from "@angular/material";
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
    /** EvaluationScenario that is being displayed. */
    private _scenario : EvaluationScenario;

    /**
     *
     * @param _dialogRef
     */
    constructor(public readonly _dialogRef: MdDialogRef<ScenarioDetailsDialogComponent>) {
        this._scenario = _dialogRef.config.data;
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