import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {MdSnackBar} from "@angular/material";
import {ConfigService} from "../core/basics/config.service";
import {UUIDGenerator} from "../shared/util/uuid-generator.util";

@Component({
    moduleId: module.id,
    selector: 'evaluation-selection',
    template: `
        <md-card class="evaluation-card">
            <md-card-header>
                <md-card-title>Vitrivr NG: Start New Evaluation</md-card-title>
                <md-card-subtitle>Please elect an evaluation template and note down your ID.</md-card-subtitle>
            </md-card-header>
            <md-card-content [style.margin-top]="'20px;'" [style.margin-bottom]="'20px;'">
                <p>
                    <md-input-container style="width:100%;">
                        <input mdInput placeholder="Evaluation ID (please keep)" [value]="randomId" disabled/>
                    </md-input-container>
                </p>

                <p>
                    <md-select placeholder="Template" [(ngModel)]="urlFieldValue" [style.width]="'100%'">
                        <md-option *ngFor="let template of templates" [value]="template.url">{{template.name}}
                        </md-option>
                    </md-select>
                   
                </p>

                <p>
                    <md-input-container style="width:100%;">
                        <input mdInput placeholder="Your name" [(ngModel)]="nameFieldValue"/>
                    </md-input-container>
                </p>
            </md-card-content>
            <md-card-actions>
                <button md-button (click)="onStartClick()">START EVALUATION</button>
            </md-card-actions>
        </md-card>

        <md-card class="evaluation-card">
            <md-card-header>
                <md-card-title>Vitrivr NG: Continue evaluation</md-card-title>
                <md-card-subtitle>Please enter your evaluation ID in order to continue.</md-card-subtitle>
            </md-card-header>
            <md-card-content [style.margin-top]="'20px;'" [style.margin-bottom]="'20px;'">
                <p>
                    <md-input-container style="width:100%;">
                        <input mdInput placeholder="Evaluation ID" [(ngModel)]="enteredId"/>
                    </md-input-container>
                </p>
            </md-card-content>
            <md-card-actions>
                <button md-button (click)="onContinueClick()">CONTINUE EVALUATION</button>
            </md-card-actions>
        </md-card>
    `
})
export class EvaluationSelectionComponent {
    /** Model for the URL field. Contains the URL to the evaluation template. */
    public urlFieldValue : string;

    /** Model for the name field. Contains the name of the participant. */
    public nameFieldValue : string;

    /** Evaluation ID entered by the user. This ID will be used to identify a participant. */
    public enteredId: string;

    /** List of evaluation templates loaded from the config. */
    public readonly templates = [];

    /** Evaluation ID generated when loading this component. This ID will be used to identify a participant. */
    public readonly randomId;

    /**
     *
     * @param _config
     * @param _router
     * @param snackBar
     */
    constructor(_config: ConfigService, private _router: Router, private snackBar: MdSnackBar) {
        this.templates = _config.evaluationTemplates;
        this.randomId = UUIDGenerator.suid();
    }

    /**
     * Invoked whenever the 'START EVALUATION' button is clicked.
     */
    public onStartClick() {
        if (this.urlFieldValue && this.nameFieldValue && this.urlFieldValue.length > 0 &&  this.nameFieldValue.length > 0) {
            this._router.navigate(['/evaluation/' + this.randomId + '/' + btoa(this.urlFieldValue) + '/' + btoa(this.nameFieldValue)]);
        } else {
            this.snackBar.open('Please specify a valid URL and your name.', null, {duration: 3000});
        }
    }

    /**
     * Invoked whenever the 'CONTINUE EVALUATION' button is clicked.
     */
    public onContinueClick() {
        if (!this.enteredId || this.enteredId.length == 0) {
            this.snackBar.open('Please enter a valid evaluation ID.', null, {duration: 3000});
            return;
        }
        this._router.navigate(['/evaluation/' + this.enteredId]);
    }

    /**
     * Invoked whenever the 'Abort' button is clicked.
     */
    public onAbortClick() {
        this._router.navigate(['/gallery']);
    }
}