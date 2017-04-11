import {EvaluationEvent} from "./evaluation-event";
import {EvaluationRating} from "./evaluation-rating";
import {EvaluationState} from "./evaluation-state";
import {MediaObjectScoreContainer} from "../../shared/model/features/scores/media-object-score-container.model";
import {TimeFormatterUtil} from "../../shared/util/TimeFormatterUtil";
import {EvaluationScenario} from "./evaluation-scenario";

export class Evaluation {

    /** Date/time of the begin of the current evaluation. */
    private begin: Date;

    /** Date/time of the end of the current evaluation. */
    private end: Date;

    /** State indicator; true if evaluation is running and false otherwise. */
    private _state: EvaluationState = EvaluationState.NotStarted;

    /** */
    private _scenario: EvaluationScenario;

    /** List of evaluation events. */
    private events: EvaluationEvent[] = [];

    /** List of evaluation events. */
    private ratings: EvaluationRating[] = [];


    private _k : number;

    /**
     *
     * @param _name
     * @param _k
     */
    constructor(scenario: EvaluationScenario) {
        this._scenario = scenario;
        this._k = scenario.k;
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
     * Getter for evaluation state.
     *
     * @returns {EvaluationState}
     */
    get state(): EvaluationState {
        return this._state;
    }

    /**
     * Getter for the K.
     *
     * @return {number}
     */
    get k(): number {
        return this._k;
    }

    /**
     * Starts the evaluation. Sets the start timestamp and changes the state to running.
     *
     * @return New state of the Evaluation object.
     */
    public start(): EvaluationState {
        if (this._state == EvaluationState.NotStarted) {
            this._state = EvaluationState.RunningQueries;
            this.begin = new Date();
        }
        return this.state;
    }

    /**
     * Accepts the provided resultset as resultset and makes the way clear for the next phase.
     *
     * @return New state of the Evaluation object.
     */
    public accept(results: MediaObjectScoreContainer[]): EvaluationState {
        if (this._state == EvaluationState.RunningQueries) {
            results.forEach((value : MediaObjectScoreContainer, index : number) => {
                this.ratings.push(new EvaluationRating(value.mediaObject.objectId, index, value.score));
            });
            this._state = EvaluationState.RankingResults;
        }
        return this.state;
    }

    /**
     * Finishes the evaluation. Sets the stop timestamp and changes the state to Finished.
     *
     * @return New state of the Evaluation object.
     */
    public stop(): EvaluationState {
        if (this._state == EvaluationState.RankingResults) {
            this._state = EvaluationState.Finished;
            this.end = new Date();
        }
        return this.state;
    }

    /**
     * Aborts the Evaluation and updates the state accordingly.
     *
     * @return New state of the Evaluation object.
     */
    public abort(): EvaluationState {
        this._state = EvaluationState.Aborted;
        this.end = new Date();
        return this.state;
    }

    /**
     * Adds a new evaluation-event to the list of evaluation events.
     *
     * @param event EvaluationEvent to be added.
     */
    public addEvent(event: EvaluationEvent) {
        if (this.state == EvaluationState.RunningQueries) {
            this.events.push(event);
        }
    }

    /**
     *
     * @returns {string}
     */
    public elapsedTime(): string {
        if (this.state == EvaluationState.NotStarted) {
            return "00:00:00";
        } else if (this.state == EvaluationState.Finished || this.state == EvaluationState.Aborted) {
            return TimeFormatterUtil.toTimer(this.end.getTime() - this.begin.getTime())
        } else {
            return TimeFormatterUtil.toTimer(new Date().getTime() - this.begin.getTime())
        }
    }

    /**
     *
     * @param index
     * @param rating
     */
    public rate(index: number, rating: number) {
        if (this.state != EvaluationState.RankingResults) return;
        if (index >= this.ratings.length) {
            console.log("Provided index " + index + " is out of bounds.");
            return;
        }
        if (rating < 0 || rating > 3) {
            console.log("Provided rang '" + rating + "' is invalid (0-3).");
            return;
        }
        this.ratings[index].rating = rating;
    }

    /**
     * Getter for the rating of the item at the specified index.
     *
     * @param index Index of item the rating should be returned for.
     * @returns {number} Rating of the item or NEGATIVE_INFINITY if index is out of bounds.
     */
    public getRating(index: number) : number {
        if (index >= this.ratings.length) {
            console.log("Provided index " + index + " is out of bounds.");
            return Number.NEGATIVE_INFINITY;
        }
        return this.ratings[index].rating;
    }


    /**
     * Calculates and returns the p@K (precision until rank k) value for
     * the current Evaluation.
     *
     * @param k The value of k. Must be > 0.
     * @returns {number}
     */
    public precisionAtK(k: number): number {
        /* Check; k must be > 0. */
        if (k <= 0) return 0;

        /* Now calculate precision. */
        let precision = 0;
        let normalisedK = k;
        for (let i=0;i<k;i++) {
            if (this.ratings[i]) {
                if (this.ratings[i].rating > 1) {
                    precision += 1;
                }
            } else {
                normalisedK-=1;
            }
        }
        return (precision/normalisedK);
    }

    /**
     * Calculates the and returns the DCG value for the
     * current Evaluation
     *
     * @return {number}
     */
    public discountedCumulativeGain() {
        let dcg = 0;
        this.ratings.forEach(function(key, value) {
            dcg += key.rating/(Math.log(2+value));
        });
        return dcg;
    }

    /**
     * Returns a compact JSON representation of the evaluation.
     */
    public toObject() : any {
        return {
            scenario: this._scenario.id,
            begin : this.begin,
            end: this.end,
            events: this.events,
            ratings: this.ratings,
            complete: (this.state == EvaluationState.Finished),
            dcg: this.discountedCumulativeGain,
            pAt5: this.precisionAtK(5),
            pAt10: this.precisionAtK(10),
            pAt15: this.precisionAtK(15),
            pAt20: this.precisionAtK(20)
        };
    }
}