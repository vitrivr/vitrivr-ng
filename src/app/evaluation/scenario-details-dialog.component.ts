import {Component} from "@angular/core";
import {MdDialogRef} from "@angular/material";
import {EvaluationScenario} from "./model/evaluation-scenario";

@Component({
    moduleId: module.id,
    selector: 'evaluation',
    template: `
        <div>
            <h2>Scenario: {{scenario ? scenario.name : "loading..."}} ({{scenario ? scenario.id : "loading..."}})</h2>
            <hr class="fade"/>
            
            <h5>Description</h5>
            <dd>{{scenario ? scenario.description : "loading..."}}</dd>
            
            <h5>Material</h5>
            <ul>
                <li *ngFor="let material of scenario.material"><a href="{{material.url}}" target="_blank" mdTooltip="{{material.description}}">{{material.name}}</a></li>
            </ul>   
            <button md-button (click)="dialogRef.close()">Close</button>
        </div>
     `
})
export class ScenarioDetailsDialogComponent {

    /** EvaluationScenario that is being displayed. */
    private _scenario : EvaluationScenario;

    /**
     *
     * @param _dialogRef
     */
    constructor(private _dialogRef: MdDialogRef<ScenarioDetailsDialogComponent>) {}

    /**
     * Getter for scenario.
     *
     * @return {EvaluationScenario}
     */
    get scenario(): EvaluationScenario {
        return this._scenario;
    }

    /**
     * Setter for scenario.
     *
     * @param value
     */
    set scenario(value: EvaluationScenario) {
        this._scenario = value;
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