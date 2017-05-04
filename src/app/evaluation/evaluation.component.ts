import {Component, OnDestroy, OnInit} from "@angular/core";
import {QueryService, QueryChange} from "../core/queries/query.service";
import {EvaluationEvent} from "./model/evaluation-event";
import {EvaluationState} from "./model/evaluation-state";
import {ResolverService} from "../core/basics/resolver.service";
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";
import {Subscription} from "rxjs";
import {MdSnackBar, MdDialog} from "@angular/material";
import {StorageService} from "../core/basics/storage.service";
import {EvaluationTemplate} from "./model/evaluation-template";
import {ActivatedRoute, Params} from "@angular/router";
import {Http} from "@angular/http";
import {EvaluationSet} from "./model/evaluation-set";
import {ScenarioDetailsDialogComponent} from "./scenario-details-dialog.component";


@Component({
    moduleId: module.id,
    selector: 'evaluation',
    templateUrl: 'evaluation.component.html'
})
export class EvaluationComponent implements OnInit, OnDestroy {

    /** Storage key used to persistently store evaluation data. */
    private static EVALUATION_STORAGE_KEY = "vitrivr_ng_evaluation";

    /** Reference to the current evaluation object. */
    private _evaluationset: EvaluationSet;

    /** Current list of query results. */
    public mediaobjects : MediaObjectScoreContainer[] = [];

    /** Reference to the subscription to the QueryService. */
    private queryServiceSubscription : Subscription;

    /** Reference to the Subscription for Router. */
    private routeSubscription : Subscription;

    /** Reference to the Subscription for Router. */
    private dialogSubscription : Subscription;

    /**
     * Constructor; injects the required services for evaluation.
     *
     * @param _queryService
     * @param _storageService
     * @param _resolverService
     * @param snackBar
     */
    constructor(
        private _queryService : QueryService,
        private _storageService: StorageService,
        private _resolverService: ResolverService,
        private _route: ActivatedRoute,
        private _http: Http,
        private _snackBar: MdSnackBar,
        private _dialog: MdDialog) {}

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
        this.routeSubscription = this._route.params.subscribe((params: Params) => this.onParamsAvailable(params));

        /**
         *
         */
        this.dialogSubscription = this._dialog.afterOpen.subscribe(dialogRef => {
            let component: ScenarioDetailsDialogComponent = <ScenarioDetailsDialogComponent>(dialogRef.componentInstance);
            component.scenario = this._evaluationset.current.scenario;
        });
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the QueryService subscription.
     */
    public ngOnDestroy() {
        this.routeSubscription.unsubscribe();
        this.queryServiceSubscription.unsubscribe();
        this.queryServiceSubscription = null;
        this.routeSubscription = null;
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
            this._snackBar.open('Evaluation started. Happy searching!', null, {duration: 2000});
        }
    }

    /**
     * Invoked whenever the 'Complete Scenario' button is clicked.
     */
    public onEvaluationStopButtonClick() {
        if (this.canBeStopped()) {
            if (this._evaluationset.current.state == EvaluationState.RankingResults) {
                this._evaluationset.current.stop();
                this._storageService.pushToArrayForKey(EvaluationComponent.EVALUATION_STORAGE_KEY, this._evaluationset.toObject());
                if (!this._evaluationset.next()) {
                    this._snackBar.open('Evaluation finished. Thank you for participating!', null, {duration: 2000});
                }
            } else {
                this._evaluationset.current.abort();
                this._snackBar.open('Evaluation aborted.', null, {duration: 2000});
            }
        }
    }

    /**
     * Invoked whenever the 'Accept results' button is clicked.
     */
    public onResultsAcceptButtonClick() {
        if (this.canBeAccepted()) {
            if (this._evaluationset.current.accept(this.mediaobjects) == EvaluationState.RankingResults) {
                this._snackBar.open('Results accepted. Now please rate the relevance of the top ' + this._evaluationset.current.k + " results." , null, {duration: 2000});
            }
        }
    }

    /**
     * Invoked whenever the 'Download results' button is clicked.
     */
    public onDownloadButtonClick() {
        let data = this._storageService.readPrimitiveForKey(EvaluationComponent.EVALUATION_STORAGE_KEY);
        if (data) {
            let blob = new Blob([data, {type: "application/json"}]);
            let url = window.URL.createObjectURL(blob);
            window.open(url);
        }
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
        }
    }

    /**
     * Invoked whenever the 'Scenario' chip is clicked.
     */
    public onScenarioClick() {
        if (!this._evaluationset) return;
        this._dialog.open(ScenarioDetailsDialogComponent);
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
        return this._evaluationset.description();
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
     *
     */
    private updateGallery() {
        let cache : MediaObjectScoreContainer[] = [];
        this._queryService.forEach(function(value : MediaObjectScoreContainer, key : string) {
            if (value.show()) cache.push(value)
        });
        if (cache.length > 1) {
            cache.sort((a : MediaObjectScoreContainer,b : MediaObjectScoreContainer) => MediaObjectScoreContainer.compareAsc(a,b))
        }
        this.mediaobjects = cache;
    }

    /**
     * Returns true if a new Evaluation can be started and false otherwise.
     *
     * Used to make UI related decisions.
     */
    public canBeStarted(): boolean {
        if (this._evaluationset == null) return false;
        return this._evaluationset.current.state == EvaluationState.NotStarted || this._evaluationset.current.state == EvaluationState.Finished || this._evaluationset.current.state ==EvaluationState.Aborted
    }

    /**
     * Returns true if the current Evaluation can be stopped or aborted and false
     * otherwise.
     *
     * Used to make UI related decisions.
     */
    public canBeStopped(): boolean {
        if (this._evaluationset == null) return false;
        return this._evaluationset.current.state == EvaluationState.RunningQueries || this._evaluationset.current.state == EvaluationState.RankingResults

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
        return this._evaluationset.current.state == EvaluationState.RankingResults;
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
     * Returns the total number of evaluation results that are available for downloading.
     *
     * @return {number}
     */
    public numberOfResults(): number {
        return this._storageService.sizeOfArray(EvaluationComponent.EVALUATION_STORAGE_KEY);
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
        let template = atob(params['template']);
        let participant = params['participant'];
        if (template && participant) {
            this.loadEvaluationTemplate(template, participant);
        } else {
            this.onEvaluationTemplateError();
        }
    }

    /**
     * This method is called whenever an error occurs during the loading
     * phase of an EvaluationTemplate i.e. if no URL was specified, the specified
     * URL is not reachable or does not point to a valid template.
     */
    private onEvaluationTemplateError() {
        this._snackBar.open('Could not load the specified evaluation template!', null, {duration: 2000});
    }

    /**
     * Tries to load an evaluation template (JSON-file) from the specified
     * URL location.
     *
     * @param url URL from which to load the template.
     * @param participant ID of the participant.
     */
    private loadEvaluationTemplate(url: string, participant: string) {
        this._http.get(url).first().subscribe(response=> {
            if (response.ok) {
                let template = EvaluationTemplate.fromJson(response.json());
                if (template) {
                    this._evaluationset = new EvaluationSet(participant, template);
                } else {
                    this.onEvaluationTemplateError();
                }
            } else {
                this.onEvaluationTemplateError();
            }
        });
    }
}