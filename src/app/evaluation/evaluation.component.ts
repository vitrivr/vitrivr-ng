import{ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {QueryService, QueryChange} from "../core/queries/query.service";
import {EvaluationEvent} from "../shared/model/evaluation/evaluation-event";
import {EvaluationState} from "../shared/model/evaluation/evaluation-state";
import {ResolverService} from "../core/basics/resolver.service";
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";
import {MdSnackBar, MdDialog, MdDialogConfig} from "@angular/material";
import {EvaluationTemplate} from "../shared/model/evaluation/evaluation-template";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {EvaluationSet} from "../shared/model/evaluation/evaluation-set";
import {ScenarioDetailsDialogComponent} from "./scenario-details-dialog.component";
import {GalleryComponent} from "../gallery/gallery.component";
import {EvaluationService} from "../core/evaluation/evaluation.service";
import {Location} from "@angular/common";
import {ConfigService} from "../core/basics/config.service";
import {Observable} from "rxjs/Observable";
import {EvaluationScenario} from "../shared/model/evaluation/evaluation-scenario";


type DisplayType = "NONE" | "SCENARIO" | "GALLERY" | "HISTORY";

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

    /**
     * Constructor; injects the required services for evaluation.
     *
     * @param _queryService
     * @param _storageService
     * @param _resolverService
     * @param snackBar
     */
    constructor(
        _cdr: ChangeDetectorRef,
        _queryService : QueryService,
        _resolver: ResolverService,
        _router: Router,
        private _location: Location,
        private _evaluation: EvaluationService,
        private _route: ActivatedRoute,
        private _snackBar: MdSnackBar,
        private _dialog: MdDialog) {
        super(_cdr,_queryService,_resolver,_router);
    }

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit() {
        this.queryServiceSubscription = this._queryService.observable
            .filter(msg => (["UPDATED", "STARTED", "ENDED", "FEATURE", "CLEAR"].indexOf(msg) > -1))
            .subscribe((msg) => this.onQueryStateChange(msg));

        /*
         * Subscribes to changes of the Router class. Whenever the parameter becomes available,
         * the onParamsAvailable method is invoked.
         */
        this._route.params.first().subscribe((params: Params) => this.onParamsAvailable(params));

        if (this._queryService.size() > 0) {
            this.updateGallery();
        }
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the QueryService subscription.
     */
    public ngOnDestroy() {
        this.queryServiceSubscription.unsubscribe();
        this.queryServiceSubscription = null;
    }

    /**
     * Getter for evaluation set.
     *
     * @return {EvaluationSet}
     */
    get evaluationset(): EvaluationSet {
        return this._evaluationset;
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
     * Getter for the currently active scenario.
     *
     * @return {any}
     */
    get currentScenario() : EvaluationScenario {
        if (this._evaluationset && this._template) {
            return this._template.evaluationScenario(this._evaluationset.position);
        } else {
            return null;
        }
    }

    /**
     * Invoked whenever the 'Start Scenario' button is clicked.
     */
    public onEvaluationStartButtonClick() {
        if (this.canBeStarted()) {
            this._evaluationset.current.start();
            this.saveEvaluation();
            this._snackBar.open('Evaluation started. Happy searching!', null, {duration: ConfigService.SNACKBAR_DURATION});
        }
    }

    /**
     * Invoked whenever the 'Abort Scenario' button is clicked.
     */
    public onEvaluationAbortButtonClick() {
        if (this.canBeAborted()) {
            this._evaluationset.current.abort();
            this.saveEvaluation();
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
                this.queryService.clear();
            }
            this.saveEvaluation();
        }
    }

    /**
     * Invoked whenever the 'Accept results' button is clicked.
     */
    public onResultsAcceptButtonClick() {
        if (this.canBeAccepted()) {
            if (this._evaluationset.current.accept(this.mediaobjects) == EvaluationState.RankingResults) {
                this.saveEvaluation();
                this._snackBar.open('Results accepted. Now please rate the relevance of the top ' + this._evaluationset.current.k + " results." , null, {duration: ConfigService.SNACKBAR_DURATION});
            }
        }
    }

    /**
     * Invoked whenever the 'Download results' button is clicked.
     */
    public onDownloadButtonClick() {
        this._evaluation.evaluationData().subscribe(
            (data) => {
                let url = window.URL.createObjectURL(data);
                window.open(url);
            }
        );
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
            this.saveEvaluation();
        }
    }

    /**
     * Invoked whenever the 'Scenario' chip is clicked.
     */
    public onScenarioClick() {
        if (!this._evaluationset) return;
        let config = new MdDialogConfig();
        config.width='500px';
        config.data = this.currentScenario;
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
     * Returns true, if the evaluation history should be displayed, and false otherwise.
     *
     * @return {boolean}
     */
    public display(): DisplayType {
        if (!this._evaluationset || !this._evaluationset.current) return "NONE";
        switch (this._evaluationset.current.state) {
            case EvaluationState.Finished:
                return "HISTORY";
            case EvaluationState.NotStarted:
            case EvaluationState.Aborted:
                return "SCENARIO";
            default:
                return "GALLERY";
        }
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
     * Returns true if the provided MediaObject has already been rated and false otherwise.
     *
     * Used to make UI related decisions.
     *
     * @param mediaobject MediaObject that should be checked.
     */
    public objectHasBeenRated(mediaobject: MediaObjectScoreContainer) {
        if (this.canBeRated() == false) return false;
        let index = this.mediaobjects.indexOf(mediaobject);
        return this._evaluationset.current.ratings[index] && this._evaluationset.current.ratings[index].rating > -1;
    }

    /**
     * Invoked whenever the QueryService reports that the results were updated. Causes
     * the gallery to be re-rendered.
     *
     * @param msg QueryChange message
     */
    protected onQueryStateChange(msg: QueryChange) {
        let event = null;
        switch (msg) {
            case "STARTED":
                if (this._evaluationset && this.canBeStarted()) this._evaluationset.current.start();
                event = new EvaluationEvent(new Date(), "STARTED", this._queryService.queryId, null);
                break;
            case "FEATURE":
                event = new EvaluationEvent(new Date(), "FEATURE_AVAILABLE", this._queryService.queryId, this._queryService.features[this._queryService.features.length-1].readableName);
                break;
            case "ENDED":
                event = new EvaluationEvent(new Date(), "ENDED", this._queryService.queryId, null);
                break;
            case "UPDATED":
                break;
        }
        if (event && this._evaluationset && this._evaluationset.current.state == EvaluationState.RunningQueries) this._evaluationset.current.addEvent(event);

        /* Call super. */
        super.onQueryStateChange(msg);
    }

    /**
     * Tries to save the recent changes to the evaluation using the evaluation service.
     */
    private saveEvaluation() {
        this._evaluation.saveEvaluation(this._evaluationset).first().subscribe(
            () => {},
            (error) => {
                console.log(error);
                this._snackBar.open('Could not persist the recent changes to the evaluation. Proceed with caution...', null, {duration: ConfigService.SNACKBAR_DURATION});
            }
        );
    }

    /**
     * Invoked once parameters from the routing become available. Tries
     * to load the specified evaluation template.
     */
    private onParamsAvailable(params: Params) {
        let participant = params['participant'];
        let template = params['template'] ? atob(params['template']) : null;
        let name =  params['name'] ? atob(params['name']) : null;
        if (template && participant) {
            this.loadRunningEvaluation(participant).catch(
                (error, caught: Observable<void>) => {
                    return this.startNewEvaluation(template, participant, name)
            }).subscribe(
                () => {
                    this._snackBar.open("Evaluation started successfully. Welcome '" + this._evaluationset.name + "'! Thank you for participating.", null, {duration: ConfigService.SNACKBAR_DURATION});
                },
                (error) => {
                    console.log(error);
                    this._snackBar.open('Could not load the specified evaluation template due to an error.', null, {duration: ConfigService.SNACKBAR_DURATION}).afterDismissed().first().subscribe(() => {
                        this._location.back();
                    });
                }
            );
        } else if (participant) {
            this.loadRunningEvaluation(participant).subscribe(
                () => {
                    this._snackBar.open("Evaluation resumed successfully. Welcome back'" + this._evaluationset.name + "'!", null, {duration: ConfigService.SNACKBAR_DURATION});
                },
                (error) => {
                    console.log(error);
                    this._snackBar.open('Could not load the specified evaluation template due to an error.', null, {duration: ConfigService.SNACKBAR_DURATION}).afterDismissed().first().subscribe(() => {
                        this._location.back();
                    });
                }
            );
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
    private loadRunningEvaluation(participant: string) : Observable<void> {
        return this._evaluation.loadEvaluation(participant).first().flatMap((evaluation) => {
            return Observable.zip(Observable.of(evaluation), this._evaluation.loadEvaluationTemplate(evaluation.template), (evaluation, template) => {
                if (template != null) {
                    this._evaluationset = evaluation;
                    this._template = template;
                } else {
                    Observable.throw("Failed to load the evaluation template from '" + evaluation.template + "'.");
                }
            });
        });
    }

    /**
     * Tries to load an evaluation template (JSON-file) from the specified URL location and start
     * a new evaluation based on that template.
     *
     * @param url URL from which to load the template.
     * @param participant ID of the participant.
     * @param name Optional name of the participant.
     */
    private startNewEvaluation(url: string, participant: string, name?:string): Observable<void> {
        return this._evaluation.loadEvaluationTemplate(url).first().map((template) => {
            if (template != null) {
                this._template = template;
                this._evaluationset = EvaluationSet.fromTemplate(participant, template, name);
            } else {
                Observable.throw("Failed to load the evaluation template from '" + template + "'.");
            }
        });
    }
}