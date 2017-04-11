import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {Md5} from 'ts-md5/dist/md5'
import {MdSnackBar} from "@angular/material";

@Component({
    moduleId: module.id,
    selector: 'evaluation-selection',
    template: `
        <md-card class="evaluation-card">
          <md-card-header>
            <md-card-title>Vitrivr NG: Evaluation</md-card-title>
            <md-card-subtitle>Please specify an evaluation template...</md-card-subtitle>
          </md-card-header>
          <md-card-content>
                <md-input-container style="width:100%;">
                    <input mdInput placeholder="http://www.example.com/evaluation.json" [(ngModel)]="urlFieldValue"/> 
                </md-input-container>
                
                 <md-input-container style="width:100%;">
                    <input mdInput placeholder="Max Muster" [(ngModel)]="nameFieldValue"/> 
                </md-input-container>
          </md-card-content>
          <md-card-actions>
            <button md-button (click)="onSelectClick()">SELECT</button>
            <button md-button (click)="onAbortClick()">ABORT</button>
          </md-card-actions>
        </md-card>
        <div>
            
        </div>
    `
})
export class EvaluationSelectionComponent {
    /** Model for the URL field. Contains the URL to the evaluation template. */
    public urlFieldValue : string;

    /** Model for the name field. Contains the name of the participant. */
    public nameFieldValue : string;

    /**
     * Default constructor; Injects Router.
     * @param _router
     */
    constructor(private _router: Router, private snackBar: MdSnackBar) {}

    /**
     * Invoked whenever the 'Select' button is clicked.
     */
    public onSelectClick() {
        if (this.urlFieldValue && this.nameFieldValue && this.urlFieldValue.length > 0 &&  this.nameFieldValue.length > 0) {
            this._router.navigate(['/evaluation/' + btoa(this.urlFieldValue) + '/' + Md5.hashStr(this.nameFieldValue)]);
        } else {
            this.snackBar.open('Please specify a valid URL and your name.', null, {duration: 2000});
        }
    }

    /**
     * Invoked whenever the 'Abort' button is clicked.
     */
    public onAbortClick() {
        this._router.navigate(['/gallery']);
    }
}