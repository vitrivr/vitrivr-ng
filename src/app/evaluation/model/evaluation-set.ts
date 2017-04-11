import {EvaluationTemplate} from "./evaluation-template";
import {Evaluation} from "./evaluation";
import {EvaluationState} from "./evaluation-state";
export class EvaluationSet {
    /** ID of the evaluation set. Required for unique identification. */
    private _id : string;

    /** Name of the evaluation template that was used to create the set. */
    private _template: string;

    /** List of evaluations (derived from the scenarios). */
    private _evaluations: Evaluation[] = [];

    /** Current / active evaluation. Should correspond with the position. */
    private _current: Evaluation;

    /** Current position in the evaluation set. */
    private _position = 0;

    /**
     * Default constructor; EvalationSets are always constructed from an
     * EvaluationTemplate.
     *
     * @param id ID of the EvaluationSet. Used for identification.
     * @param template EvaluationTemplate to use.
     */
    constructor(id : string, template: EvaluationTemplate) {
        this._id = id;
        this._template = template.name;
        for (let i=0; i<template.numberOfScenarios(); i++) {
            this._evaluations.push(new Evaluation(template.evaluationScenario(i)));
        }
        this._position = 0;
        this._current = this._evaluations[0];
    }

    /**
     * Getter for ID.
     *
     * @return {string}
     */
    get id(): string {
        return this._id;
    }

    /**
     * Getter for template.
     *
     * @return {string}
     */
    get template(): string {
        return this._template;
    }

    /**
     * Getter for current.
     *
     * @return {Evaluation}
     */
    get current(): Evaluation {
        return this._current;
    }

    /**
     * Getter for position.
     *
     * @return {number}
     */
    get position(): number {
        return this._position;
    }

    /**
     * Moves to the next evaluation in the set. Returns true if
     * pointer was moved and false otherwise.
     *
     * @return {boolean}
     */
    public next() : boolean {
        if (this._position + 1 < this._evaluations.length) {
            this._position += 1;
            this._current = this._evaluations[this._position];
            return true;
        } else {
            return false;
        }
    }

    /**
     * Moves to the previous evaluation in the set. Returns true if
     * pointer was moved and false otherwise.
     *
     * @return {boolean}
     */
    public previous() : boolean {
        if (this._position - 1 >= 0) {
            this._position -= 1;
            this._current = this._evaluations[this._position];
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns true if evaluation set was completed (i.e. all evaluations
     * were finished) and false otherwise.
     *
     * @return {boolean}
     */
    public finished() : boolean {
       for (let evaluation of this._evaluations) {
           if (evaluation.state !== EvaluationState.Finished) return false;
       }
       return true;
    }

    /**
     * Returns the number of evaluations in this evaluation set.
     *
     * @return {number}
     */
    public count() : number {
        return this._evaluations.length;
    }

    /**
     * Returns a string that briefly describes the current state of the scenario set. That is,
     * the current scenario, current position and total number of scenarios.
     *
     * @return {string}
     */
    public description() : string {
        return this.current.scenario.name + " (" + (this._position + 1) + "/" + this.count() + ")";
    }

    /**
     * Returns a compact JSON representation of the evaluation.
     */
    public toObject() : any {
        let object = {id: this.id, template : this._template, evaluations: []};
        for (let evaluation of this._evaluations) {
            object.evaluations.push(evaluation.toObject());
        }
        return object;
    }
}