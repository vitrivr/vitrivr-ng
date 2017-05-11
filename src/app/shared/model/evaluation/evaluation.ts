import {EvaluationEvent} from "./evaluation-event";
import {EvaluationRating} from "./evaluation-rating";
import {EvaluationState} from "./evaluation-state";
import {MediaObjectScoreContainer} from "../features/scores/media-object-score-container.model";
import {TimeFormatterUtil} from "../../util/TimeFormatterUtil";
import {EvaluationScenario} from "./evaluation-scenario";

/**
 * Represents a single evaluation scenario.
 */
export class Evaluation {

    /** Date/time of the begin of the current evaluation. */
    private _begin: Date;

    /** Date/time of the end of the current evaluation. */
    private _end: Date;

    /** The number of items that should be ranked (counted from the top). */
    private _k : number;

    /** State indicator; true if evaluation is running and false otherwise. */
    private _state: EvaluationState = EvaluationState.NotStarted;

    /** ID of the EvaluationScenario */
    private _scenario: string;

    /** List of evaluation events. */
    private _events: EvaluationEvent[] = [];

    /** List of evaluation events. */
    private _ratings: EvaluationRating[] = [];

    /**
     * Getter for begin date.
     *
     * @return {Date}
     */
    get begin(): Date {
        return this._begin;
    }

    /**
     * Getter for end date.
     *
     * @return {Date}
     */
    get end(): Date {
        return this._end;
    }

    /**
     * Getter for scenario.
     *
     * @return {EvaluationScenario}
     */
    get scenario(): string {
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
     * Getter for EvaluationEvents
     *
     * @return {EvaluationEvent[]}
     */
    get events(): EvaluationEvent[] {
        return this._events;
    }

    /**
     * Getter for EvaluationRating
     *
     * @return {EvaluationRating[]}
     */
    get ratings(): EvaluationRating[] {
        return this._ratings;
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
        if (this._state == EvaluationState.NotStarted || this._state == EvaluationState.Aborted) {
            this._state = EvaluationState.RunningQueries;
            this._begin = new Date();
        }
        return this.state;
    }

    /**
     * Accepts the provided result set as result set and makes the way clear for the next phase. To save space,
     * only k + 10 items are selected from the result set.
     *
     * @return New state of the Evaluation object.
     */
    public accept(results: MediaObjectScoreContainer[]): EvaluationState {
        if (this._state == EvaluationState.RunningQueries) {
            results.forEach((value : MediaObjectScoreContainer, index : number) => {
                if (index < this._k + 10) {
                    this._ratings.push(new EvaluationRating(value.mediaObject.objectId, value.representativeSegment.segmentId, index, value.score));
                }
            });
            this._state = EvaluationState.RankingResults;
        }
        return this.state;
    }

    /**
     * Finishes the evaluation. Sets the complete timestamp and changes the state to Finished.
     *
     * @return New state of the Evaluation object.
     */
    public complete(): EvaluationState {
        if (this._state == EvaluationState.RankingResults) {
            this._state = EvaluationState.Finished;
            this._end = new Date();
        }
        return this.state;
    }

    /**
     * Aborts the Evaluation and updates the state accordingly.
     *
     * @return New state of the Evaluation object.
     */
    public abort(): EvaluationState {
        if (this._state != EvaluationState.Aborted && this._state != EvaluationState.NotStarted) {
            this._state = EvaluationState.Aborted;
            this._begin = null;
            this._end = null;
            this._events = [];
            this._ratings = [];
            return this.state;
        }
    }

    /**
     * Adds a new evaluation-event to the list of evaluation events.
     *
     * @param event EvaluationEvent to be added.
     */
    public addEvent(event: EvaluationEvent) {
        if (this.state == EvaluationState.RunningQueries) {
            this._events.push(event);
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
            return TimeFormatterUtil.toTimer(this._end.getTime() - this._begin.getTime())
        } else {
            return TimeFormatterUtil.toTimer(new Date().getTime() - this._begin.getTime())
        }
    }

    /**
     *
     * @param index
     * @param rating
     */
    public rate(index: number, rating: number) {
        if (this.state != EvaluationState.RankingResults) return;
        if (index >= this._ratings.length) {
            console.log("Provided index " + index + " is out of bounds.");
            return;
        }
        if (rating < 0 || rating > 3) {
            console.log("Provided rang '" + rating + "' is invalid (0-3).");
            return;
        }
        this._ratings[index].rating = rating;
    }

    /**
     * Getter for the rating of the item at the specified index.
     *
     * @param index Index of item the rating should be returned for.
     * @returns {number} Rating of the item or NEGATIVE_INFINITY if index is out of bounds.
     */
    public getRating(index: number) : number {
        if (index >= this._ratings.length) {
            console.log("Provided index " + index + " is out of bounds.");
            return Number.NEGATIVE_INFINITY;
        }
        return this._ratings[index].rating;
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
            if (this._ratings[i]) {
                if (this._ratings[i].rating > 1) {
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
        this._ratings.forEach(function(key, value) {
            dcg += key.rating/(Math.log(2+value));
        });
        return dcg;
    }

    /**
     * Creates and returns a compact object representation of the Evaluation (no
     * type). This representation can be used for serialisation.
     *
     * @param evaluation Evaluation that should be serialised.
     * @return {{scenario: string, begin: Date, end: Date, k: number, events: EvaluationEvent[], ratings: Array, state: number, dcg: number, pAtK: number}}
     */
    public static serialise(evaluation: Evaluation) : any {
        let object = {
            scenario: evaluation._scenario,
            begin : evaluation._begin,
            end: evaluation._end,
            k: evaluation._k,
            events: [],
            ratings: [],
            state: evaluation.state.valueOf(),
            dcg: evaluation.discountedCumulativeGain(),
            pAtK: evaluation.precisionAtK(evaluation._k)
        };

        /* Serialise ratings and push them into the array. */
        for (let rating of evaluation._ratings) {
            object.ratings.push(EvaluationRating.serialise(rating));
        }

        /* Serialise events and push them into the array. */
        for (let event of evaluation._events) {
            object.events.push(EvaluationEvent.serialise(event));
        }

        return object;
    }

    /**
     * Deserialises an Evaluation from a plain JavaScript object. The field-names in the object must
     * correspond to the field names of the Evaluation, without the _ prefix.
     *
     * @param object
     * @return {Evaluation}
     */
    public static deserialise(object: any) : Evaluation {
        let evaluation = new Evaluation();
        evaluation._begin = object["begin"];
        evaluation._end = object["end"];
        evaluation._state = <EvaluationState>object["state"];
        evaluation._k = object["k"];
        evaluation._ratings = [];
        evaluation._events = [];

        /* De-serialise ratings and push them into the array. */
        for (let rating of object["ratings"]) {
            evaluation._ratings.push(EvaluationRating.deserialise(rating));
        }

        /* De-serialise events and push them into the array. */
        for (let event of object["events"]) {
            evaluation._events.push(EvaluationEvent.deserialise(event));
        }

        return evaluation;
    }

    /**
     *
     * @param scenario
     */
    public static fromScenario(scenario: EvaluationScenario): Evaluation {
        let evaluation = new Evaluation();
        evaluation._scenario = scenario.id;
        evaluation._k = scenario.k;
        return evaluation;
    }
}