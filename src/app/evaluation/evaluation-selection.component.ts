import {Component, OnDestroy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material";
import {ConfigService} from "../core/basics/config.service";
import {UUIDGenerator} from "../shared/util/uuid-generator.util";
import {Subscription} from "rxjs";

@Component({
    moduleId: module.id,
    selector: 'evaluation-selection',
    templateUrl: 'evaluation-selection.component.html'
})
export class EvaluationSelectionComponent implements OnInit, OnDestroy {

    /** Model for the URL field. Contains the URL to the evaluation template. */
    public urlFieldValue : string;

    /** Model for the name field. Contains the name of the participant. */
    public nameFieldValue : string;

    /** Evaluation ID entered by the user. This ID will be used to identify a participant. */
    public enteredId: string;

    /** List of evaluation templates loaded from the config. */
    public templates = [];

    /** Evaluation ID generated when loading this component. This ID will be used to identify a participant. */
    public readonly randomId;

    /** Reference to the ConfigService subscription. */
    private _configServiceSubscription: Subscription;

    /**
     *
     * @param _configService
     * @param _router
     * @param snackBar
     */
    constructor(private _configService: ConfigService, private _router: Router, private snackBar: MatSnackBar) {
        this.randomId = UUIDGenerator.suid();
    }

    /**
     * Lifecycle Hook (onInit): Subscribes to the ConfigService.
     */
    public ngOnInit(): void {
        this._configServiceSubscription = this._configService.observable.subscribe((config) => {
            if (config.evaluationOn == true) {
                this.templates = config.evaluationTemplates;
            }
        });
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the ConfigService.
     */
    public ngOnDestroy(): void {
        this._configServiceSubscription.unsubscribe();
        this._configServiceSubscription = null;
    }

    /**
     * Invoked whenever the 'START EVALUATION' button is clicked.
     */
    public onStartClick() {
        if (this.urlFieldValue && this.nameFieldValue && this.urlFieldValue.length > 0 &&  this.nameFieldValue.length > 0) {
            this._router.navigate(['/evaluation/' + this.randomId + '/' + btoa(this.urlFieldValue) + '/' + btoa(this.nameFieldValue)]);
        } else {
            this.snackBar.open('Please specify a valid template and your name.', null, {duration: 3000});
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