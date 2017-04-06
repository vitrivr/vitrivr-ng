import {Component, OnDestroy, OnInit} from "@angular/core";
import {QueryService, QueryChange} from "../core/queries/query.service";
import {Evaluation} from "./model/evaluation";
import {EvaluationEvent} from "./model/evaluation-event";
import {EvaluationState} from "./model/evaluation-state";
import {ResolverService} from "../core/basics/resolver.service";
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";
import {Subscription} from "rxjs";
import {MdSnackBar} from "@angular/material";
import {StorageService} from "../core/basics/storage.service";


@Component({
    moduleId: module.id,
    selector: 'evaluation',
    templateUrl: 'evaluation.component.html'
})
export class EvaluationComponent implements OnInit, OnDestroy {
    /** Storage key used to persistently store evaluation data. */
    private static EVALUATION_STORAGE_KEY = "vitrivr_ng_evaluation";

    /** Reference to the current evaluation object. */
    private _evaluation: Evaluation;

    /** Holds the value of the name input field. Defaults to an empty string. */
    public nameFieldValue: string = "";

    /** Current list of query results. */
    public mediaobjects : MediaObjectScoreContainer[] = [];

    /** Reference to the subscription to the QueryService. */
    private queryServiceSubscription : Subscription;

    /** */
    private k: number = 10;

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
        private snackBar: MdSnackBar) {}

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit() {
        this.queryServiceSubscription = this._queryService.observable()
            .filter(msg => (["UPDATED", "STARTED", "ENDED", "FEATURE"].indexOf(msg) > -1))
            .subscribe((msg) => this.processQueryStateChange(msg));
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the QueryService subscription.
     */
    public ngOnDestroy() {
        this.queryServiceSubscription.unsubscribe();
        this.queryServiceSubscription = null;
    }

    /**
     *
     */
    public onEvaluationStartButtonClick() {
        if (this.canBeStarted()) {
            if (this.nameFieldValue.trim().length > 0) {
                this._evaluation = new Evaluation(this.nameFieldValue.trim());
                this._evaluation.start();
                this.snackBar.open('Evaluation started. Happy searching!', null, {duration: 2000});
            } else {
                this.snackBar.open('You must specify a name for the evaluation.', null, {duration: 2000});
            }
        }
    }

    /**
     *
     */
    public onEvaluationStopButtonClick() {
        if (this.canBeStopped()) {
            if (this.evaluation.state == EvaluationState.RankingResults) {
                this._evaluation.stop();
                this._storageService.pushToArrayForKey(EvaluationComponent.EVALUATION_STORAGE_KEY, this.evaluation);
                this.snackBar.open('Evaluation stopped. Thank you for participating!', null, {duration: 2000});
            } else {
                this._evaluation.abort();
                this.snackBar.open('Evaluation aborted.', null, {duration: 2000});
            }
        }
    }

    /**
     *
     */
    public onResultsAcceptButtonClick() {
        if (this.canBeAccepted()) {
            if (this._evaluation.accept(this.mediaobjects) == EvaluationState.RankingResults) {
                this.snackBar.open('Results accepted. Now please rate the relevance of the top ' + this.k + " results." , null, {duration: 2000});
            }
        }
    }

    /**
     *
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
            this.evaluation.rate(objectindex, rating);
        }
    }

    /**
     *
     * @param mediaobject
     * @param rank
     * @returns {any}
     */
    public colorForButton(mediaobject : MediaObjectScoreContainer, rank : number) {
        let objectindex = this.mediaobjects.indexOf(mediaobject);
        let objectrank = this.evaluation.getRating(objectindex);
        if (objectrank >= rank) {
            return "#FFD700";
        } else {
            return "#FFFFFF";
        }
    }



    /**
     * Getter for evaluation.
     *
     * @returns {Evaluation}
     */
    get evaluation(): Evaluation {
        return this._evaluation;
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
     *
     * @param msg
     */
    private processQueryStateChange(msg: QueryChange) {
        if (this._evaluation && this._evaluation.state == EvaluationState.RunningQueries) {
            let event = null;
            switch (msg) {
                case "STARTED":
                    event = new EvaluationEvent(new Date(), "STARTED", this._queryService.getQueryId(), null);
                    break;
                case "FEATURE":
                    event = new EvaluationEvent(new Date(), "FEATURE_AVAILABLE", this._queryService.getQueryId(), this._queryService.getFeatures()[this._queryService.getFeatures().length-1].readableName);
                    break;
                case "ENDED":
                    event = new EvaluationEvent(new Date(), "ENDED", this._queryService.getQueryId(), null);
                    break;
                case "UPDATED":
                    this.updateGallery();
                    break;
            }
            if (event) this._evaluation.addEvent(event);
        }
    }

    /**
     *
     * @returns {any}
     */
    public stateDescriptor() : string {
        if (!this.evaluation) return "Not started";
        switch (this.evaluation.state) {
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
        if (this.evaluation == null) return true;
        return this.evaluation.state == EvaluationState.NotStarted || this.evaluation.state ==EvaluationState.Finished || this.evaluation.state ==EvaluationState.Aborted
    }

    /**
     * Returns true if the current Evaluation can be stopped or aborted and false
     * otherwise.
     *
     * Used to make UI related decisions.
     */
    public canBeStopped(): boolean {
        if (this.evaluation == null) return false;
        return this.evaluation.state == EvaluationState.RunningQueries || this.evaluation.state == EvaluationState.RankingResults

    }

    /**
     * Returns true if the current Evaluation has results available that can be accepted false
     * otherwise.
     *
     * Used to make UI related decisions.
     */
    public canBeAccepted(): boolean {
        if (this.evaluation == null) return false;
        return this.evaluation.state == EvaluationState.RunningQueries && this.mediaobjects.length > 0;
    }

    /**
     * Returns true if the current Evaluation allows for ranking and false otherwise.
     *
     * Used to make UI related decisions.
     */
    public canBeRated(): boolean {
        if (this.evaluation == null) return false;
        return this.evaluation.state == EvaluationState.RankingResults;
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
        return this.mediaobjects.indexOf(mediaobject) < this.k
    }

    /**
     * Returns the total number of evaluation results that are available for downloading.
     *
     * @return {number}
     */
    public numberOfResults(): number {
        return this._storageService.sizeOfArray(EvaluationComponent.EVALUATION_STORAGE_KEY);
    }
}