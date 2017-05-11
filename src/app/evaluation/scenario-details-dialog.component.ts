import {Component} from "@angular/core";
import {MdDialogRef} from "@angular/material";
import {EvaluationScenario} from "../shared/model/evaluation/evaluation-scenario";

@Component({
    moduleId: module.id,
    selector: 'evaluation',
    template: `        
        <h2 md-dialog-title>Scenario: {{scenario.name}} (ID: {{scenario.id}})</h2>
        <hr class="fade"/>
        <md-dialog-content>
            <h5>Task description</h5>
            <p [innerHTML]="scenario.description"></p>
            <div *ngIf="scenario.illustrations.length > 0">
                <h5>Illustrations</h5>
                <img *ngFor="let illustration of scenario.illustrations" src="{{illustration.url}}"  mdTooltip="{{illustration.description}}" [style.width]="'200px'"/>
            </div>
            
            <div *ngIf="scenario.material.length > 0">
                <h5>Helper material (Download)</h5>
                <ul>
                    <li *ngFor="let material of scenario.material"><a href="{{material.url}}" mdTooltip="{{material.description}}" download>{{material.name}}</a></li>
                </ul>
            </div>
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