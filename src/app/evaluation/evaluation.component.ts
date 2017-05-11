import {Component, OnDestroy, OnInit} from "@angular/core";
import {QueryService, QueryChange} from "../core/queries/query.service";
import {EvaluationEvent} from "../shared/model/evaluation/evaluation-event";
import {EvaluationState} from "../shared/model/evaluation/evaluation-state";
import {ResolverService} from "../core/basics/resolver.service";
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";
import {Subscription} from "rxjs";
import {MdSnackBar, MdDialog, MdDialogConfig} from "@angular/material";
import {EvaluationTemplate} from "../shared/model/evaluation/evaluation-template";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {EvaluationSet} from "../shared/model/evaluation/evaluation-set";
import {ScenarioDetailsDialogComponent} from "./scenario-details-dialog.component";
import {GalleryComponent} from "../gallery/gallery.component";
import {EvaluationService} from "../core/evaluation/evaluation.service";
import {Location} from "@angular/common";
import {ConfigService} from "../core/basics/config.service";

@Component({
    moduleId: module.id,
    selector: 'evaluation',
    templateUrl: 'evaluation.component.html',
    styleUrls: ['evaluation.component.css']
})
export class EvaluationComponent extends GalleryComponent implements OnInit, OnDestroy {
    /** Reference to the current evaluation object. */
    private _evaluationset: EvaluationSet;

    /** Reference to the current evaluation object. */
    private _template: EvaluationTemplate;

    /** Reference to the subscription to the QueryService. */
    private queryServiceSubscription : Subscription;

    /**
     * Constructor; injects the required services for evaluation.
     *
     * @param _queryService
     * @param _storageService
     * @param _resolverService
     * @param snackBar
     */
    constructor(
        _queryService : QueryService,
        _resolver: ResolverService,
        _router: Router,
        private _location: Location,
        private _evaluation: EvaluationService,
        private _route: ActivatedRoute,
        private _snackBar: MdSnackBar,
        private _dialog: MdDialog) {
        super(_queryService, _resolver, _router);
    }

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit() {
        this.queryServiceSubscription = this._queryService.observable
            .filter(msg => (["UPDATED", "STARTED", "ENDED", "FEATURE"].indexOf(msg) > -1))
            .subscribe((msg) => this.processQueryStateChange(msg));

        /*
         * Subscribes to changes of the Router class. Whenever the parameter becomes available,
         * the onParamsAvailable method is invoked.
         */
        this._route.params.first().subscribe((params: Params) => this.onParamsAvailable(params));
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the QueryService subscription.
     */
    public ngOnDestroy() {
        this.queryServiceSubscription.unsubscribe();
        this.queryServiceSubscription = null;
    }

    /**
     * Getter for queryService field.
     *
     * @returns {QueryService}
     */
    get queryService(): QueryService {
        return this._queryService;
    }

    /**
     * Invoked whenever the 'Start Scenario' button is clicked.
     */
    public onEvaluationStartButtonClick() {
        if (this.canBeStarted()) {
            this._evaluationset.current.start();
            this._evaluation.saveEvaluation(this._evaluationset);
            this._snackBar.open('Evaluation started. Happy searching!', null, {duration: ConfigService.SNACKBAR_DURATION});
        }
    }

    /**
     * Invoked whenever the 'Abort Scenario' button is clicked.
     */
    public onEvaluationAbortButtonClick() {
        if (this.canBeAborted()) {
            this._evaluationset.current.abort();
            this._evaluation.saveEvaluation(this._evaluationset);
            this._snackBar.open('Scenario aborted. You can restart it any time.', null, {duration: ConfigService.SNACKBAR_DURATION});
        }
    }

    /**
     * Invoked whenever the 'Complete Scenario' button is clicked.
     */
    public onEvaluationCompleteButtonClick() {
        if (this.canBeCompleted() && this._evaluationset.current.state == EvaluationState.RankingResults) {
            this._evaluationset.current.complete();
            if (!this._evaluationset.next()) {
                this._snackBar.open('Evaluation completed. Thank you for participating!', null, {duration: ConfigService.SNACKBAR_DURATION});
            } else {
                this._snackBar.open('Next scenario is up ahead!', null, {duration: ConfigService.SNACKBAR_DURATION});
            }
            this._evaluation.saveEvaluation(this._evaluationset);
        }
    }

    /**
     * Invoked whenever the 'Accept results' button is clicked.
     */
    public onResultsAcceptButtonClick() {
        if (this.canBeAccepted()) {
            if (this._evaluationset.current.accept(this.mediaobjects) == EvaluationState.RankingResults) {
                this._evaluation.saveEvaluation(this._evaluationset);
                this._snackBar.open('Results accepted. Now please rate the relevance of the top ' + this._evaluationset.current.k + " results." , null, {duration: ConfigService.SNACKBAR_DURATION});
            }
        }
    }

    /**
     * Invoked whenever the 'Download results' button is clicked.
     */
    public onDownloadButtonClick() {
        let url = window.URL.createObjectURL(this._evaluation.evaluationData());
        window.open(url);
    }

    /**
     * This method is invoked whenever someone hits the ranking (star) buttons on an object.
     *
     * @param object MediaObjectScoreContainer for which the star button was clicked.
     * @param rating The rating that was given to the MediaObjectScoreContainer
     */
    public onRateButtonClick(object : MediaObjectScoreContainer, rating : number) {
        if (!this.canBeRated()) return;
        let objectindex = this.mediaobjects.indexOf(object);
        if (objectindex > -1) {
            this._evaluationset.current.rate(objectindex, rating);
            this._evaluation.saveEvaluation(this._evaluationset);
        }
    }

    /**
     * Invoked whenever the 'Scenario' chip is clicked.
     */
    public onScenarioClick() {
        if (!this._evaluationset) return;
        let config = new MdDialogConfig();
        config.width='500px';
        config.data = this._template.evaluationScenario(this._evaluationset.position);
        this._dialog.open(ScenarioDetailsDialogComponent, config);
    }

    /**
     * Returns the colour of the star-button for the specified mediaobject and the specified rank.
     * If the button is active, then the colour will be yellow otherwise it is white.
     *
     * @param mediaobject MediaObjectScoreContainer to which the star-button belongs.
     * @param rank Rank the star-button is representing.
     * @returns {any}
     */
    public colorForButton(mediaobject : MediaObjectScoreContainer, rank : number) {
        let objectindex = this.mediaobjects.indexOf(mediaobject);
        let objectrank = this._evaluationset.current.getRating(objectindex);
        if (objectrank >= rank) {
            return "#FFD700";
        } else {
            return "#FFFFFF";
        }
    }

    /**
     * Returns a string descriptor of the current scenario or an
     * indication if no scenario is currently active.
     *
     * @return {string}
     */
    public scenarioDescriptor() : string {
        if (!this._evaluationset) return "n/a";
        if (!this._template) return "loading...";
        return this._template.evaluationScenario(this._evaluationset.position).name + " (" + (this._evaluationset.position + 1) + "/" + this._evaluationset.count() + ")";
    }

    /**
     * Returns a string descriptor of the current scenario state or
     * an indication if no scenario is currently active.
     *
     * @returns {string}
     */
    public stateDescriptor() : string {
        if (!this._evaluationset) return "n/a";
        switch (this._evaluationset.current.state) {
            case EvaluationState.NotStarted:
                return "Not started";
            case EvaluationState.RunningQueries:
                return "Running queries";
            case EvaluationState.RankingResults:
                return "Ranking results";
            case EvaluationState.Aborted:
                return "Aborted";
            case EvaluationState.Finished:
                return "Finished";
        }
    }

    /**
     * Returns a string descriptor of the current scenario state or
     * an indication if no scenario is currently active.
     *
     * @returns {string}
     */
    public stateColor() : string {
        if (!this._evaluationset) return "";
        switch (this._evaluationset.current.state) {
            case EvaluationState.NotStarted:
                return "";
            case EvaluationState.RunningQueries:
                return "accent";
            case EvaluationState.RankingResults:
                return "accent";
            case EvaluationState.Aborted:
                return "warn";
            case EvaluationState.Finished:
                return "#00FF00";
        }
    }

    /**
     * Returns true if a new Evaluation can be started and false otherwise.
     *
     * Used to make UI related decisions.
     */
    public canBeStarted(): boolean {
        if (this._evaluationset == null) return false;
        return this._evaluationset.current.state == EvaluationState.NotStarted || this._evaluationset.current.state == EvaluationState.Aborted
    }

    /**
     * Returns true if the current Evaluation can be stopped or aborted and false
     * otherwise.
     *
     * Used to make UI related decisions.
     */
    public canBeAborted(): boolean {
        if (this._evaluationset == null) return false;
        return this._evaluationset.current.state != EvaluationState.NotStarted && this._evaluationset.current.state != EvaluationState.Aborted;
    }

    /**
     *
     * @return {boolean}
     */
    public canBeCompleted(): boolean {
        if (this._evaluationset == null) return false;
        return this._evaluationset.current.state == EvaluationState.RankingResults

    }

    /**
     * Returns true if the current Evaluation has results available that can be accepted false
     * otherwise.
     *
     * Used to make UI related decisions.
     */
    public canBeAccepted(): boolean {
        if (this._evaluationset == null) return false;
        return this._evaluationset.current.state == EvaluationState.RunningQueries && this.mediaobjects.length > 0;
    }

    /**
     * Returns true if the current Evaluation allows for ranking and false otherwise.
     *
     * Used to make UI related decisions.
     */
    public canBeRated(): boolean {
        if (this._evaluationset == null) return false;
        return this._evaluationset.current.state == EvaluationState.RankingResults && this.mediaobjects.length > 0;
    }

    /**
     * Returns true if the provided MediaObject can be rated and false otherwise. This
     * depends on the current state of the evaluation and its rank.
     *
     * Used to make UI related decisions.
     *
     * @param mediaobject MediaObject that should be checked.
     */
    public objectCanBeRated(mediaobject: MediaObjectScoreContainer) {
        if (this.canBeRated() == false) return false;
        return this.mediaobjects.indexOf(mediaobject) < this._evaluationset.current.k
    }

    /**
     *
     * @param msg
     */
    private processQueryStateChange(msg: QueryChange) {
        if (this._evaluationset && this._evaluationset.current.state == EvaluationState.RunningQueries) {
            let event = null;
            switch (msg) {
                case "STARTED":
                    event = new EvaluationEvent(new Date(), "STARTED", this._queryService.queryId, null);
                    break;
                case "FEATURE":
                    event = new EvaluationEvent(new Date(), "FEATURE_AVAILABLE", this._queryService.queryId, this._queryService.features[this._queryService.features.length-1].readableName);
                    break;
                case "ENDED":
                    event = new EvaluationEvent(new Date(), "ENDED", this._queryService.queryId, null);
                    break;
                case "UPDATED":
                    this.updateGallery();
                    break;
            }
            if (event) this._evaluationset.current.addEvent(event);
        }
    }

    /**
     * Invoked once parameters from the routing become available. Tries
     * to load the specified evaluation template.
     */
    private onParamsAvailable(params: Params) {
        let participant = params['participant'] ? atob(params['participant']) : null;
        let template = params['template'] ? atob(params['template']) : null;
        let name =  params['name'] ? atob(params['name']) : null;
        if (template && participant) {
            if (!this.loadRunningEvaluation(participant)) {
                this.startNewEvaluation(template,participant,name);
            }
        } else if (participant) {
            if (!this.loadRunningEvaluation(participant)) {
                this._snackBar.open("Could not find an ongoing evaluation for the provided ID '" + participant + "'.", null, {duration: ConfigService.SNACKBAR_DURATION}).afterDismissed().first().subscribe(() => {
                    this._location.back();
                });
            }
        } else {
            this._snackBar.open('Could not load the evaluation module because some information is missing.', null, {duration: ConfigService.SNACKBAR_DURATION}).afterDismissed().first().subscribe(() => {
                this._location.back();
            });
        }
    }

    /**
     * Tries to resume a running evaluation given a participant ID.
     *
     * @param participant Participant ID for the running evaluation.
     * @return {boolean} true if a running evaluation could be loaded from local storage, false otherwise.
     */
    private loadRunningEvaluation(participant: string): boolean {
        let set = this._evaluation.loadEvaluation(participant);
        if (set != null) {
            this._evaluationset = set;
            this._evaluation.loadEvaluationTemplate(this._evaluationset.template).first().subscribe(
                template => {
                    this._template = template;
                    this._snackBar.open("Evaluation resumed successfully. Welcome back '" + this._evaluationset.name + "'!", null, {duration: ConfigService.SNACKBAR_DURATION});
                },
                error => {
                    console.log(error);
                    this._snackBar.open('Could not load the specified evaluation template due to an error.', null, {duration: ConfigService.SNACKBAR_DURATION}).afterDismissed().first().subscribe(() => {
                        this._location.back();
                    });
                }
            );
            return true;
        } else {
            return false;
        }
    }

    /**
     * Tries to load an evaluation template (JSON-file) from the specified URL location and start
     * a new evaluation based on that template.
     *
     * @param url URL from which to load the template.
     * @param participant ID of the participant.
     * @param name Optional name of the participant.
     */
    private startNewEvaluation(url: string, participant: string, name?:string) {
        this._evaluation.loadEvaluationTemplate(url).first().subscribe(
            template => {
                this._template = template;
                this._evaluationset = EvaluationSet.fromTemplate(participant, template, name);
                this._snackBar.open('Evaluation loaded successfully. Thank you for participating!', null, {duration: ConfigService.SNACKBAR_DURATION});
            },
            error => {
                console.log(error);
                this._snackBar.open('Could not load the specified evaluation template due to an error.', null, {duration: ConfigService.SNACKBAR_DURATION}).afterDismissed().first().subscribe(() => {
                     this._location.back();
                });
            }
        );
    }
}