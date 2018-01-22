import {Component, Input} from "@angular/core";
import {EvaluationScenario} from "../shared/model/evaluation/evaluation-scenario";
@Component({
    moduleId: module.id,
    selector: 'scenario-details',
    template: `        
        <div>
            <h5>Task description</h5>
            <p [innerHTML]="scenario.description"></p>
            <div *ngIf="scenario.illustrations.length > 0">
                <h5>Illustrations</h5>
                <img *ngFor="let illustration of scenario.illustrations" src="{{illustration.url}}"  matTooltip="{{illustration.description}}" [style.width]="'200px'"/>
            </div>

            <div *ngIf="scenario.material.length > 0">
                <h5>Helper material (Download)</h5>
                <ul>
                    <li *ngFor="let material of scenario.material"><a href="{{material.url}}" matTooltip="{{material.description}}" download>{{material.name}}</a></li>
                </ul>
            </div>
        </div>
    `
})
export class ScenarioDetailsComponent {

    /** EvaluationScenario that is being displayed. */
    @Input("scenario")
    private _scenario : EvaluationScenario;

    /**
     * Getter for scenario.
     *
     * @return {EvaluationScenario}
     */
    get scenario(): EvaluationScenario {
        return this._scenario;
    }
}