import {EvaluationTemplate} from "./evaluation-template";
import {Evaluation} from "./evaluation";
import {EvaluationState} from "./evaluation-state";

export class EvaluationSet {
    /** ID of the evaluation set. Required for unique identification. */
    private _id : string;

    /** URL of the evaluation template that was used to create the set. */
    private _template: string;

    /** List of evaluations (derived from the scenarios). */
    private _evaluations: Evaluation[] = [];

    /** Current / active evaluation. Should correspond with the position. */
    private _current: Evaluation;

    /** Current position in the evaluation set. */
    private _position = 0;

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
     * Setter for position. Makes sure, that the position is within the bounds of the
     * available Evaluation scenarios.
     *
     * @param position
     */
    set position(position: number) {
        if (position >= 0 && position < this._evaluations.length) {
            this._position = position;
            this._current = this._evaluations[this._position];
        }
    }

    /**
     * Moves to the next evaluation in the set. Returns true if
     * pointer was moved and false otherwise.
     *
     * @return {boolean}
     */
    public next() : boolean {
        if (this._position + 1 < this._evaluations.length) {
            this.position = this.position + 1;
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
            this.position = this.position - 1;
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
     * Creates and returns a compact object representation of the EvaluationSet (no
     * type). This representation can be used for serialisation.
     *
     * @param set EvaluationSet that should be serialised
     * @return {{id: string, template: string, evaluations: Array}}
     */
    public static serialise(set: EvaluationSet) : any {
        let object = {
            id: set.id,
            template : set._template,
            position : set._position,
            evaluations: []};
        for (let evaluation of set._evaluations) {
            object.evaluations.push(Evaluation.serialise(evaluation));
        }
        return object;
    }

    /**
     * Deserialises an EvaluationSet from a plain JavaScript object. The field-names in the object must
     * correspond to the field names of the EvaluationSet, without the _ prefix.
     *
     * @param object
     * @return {EvaluationSet}
     */
    public static deserialise(object: any) : EvaluationSet {
        let set = new EvaluationSet();
        set._id = object["id"];
        set._template = object["template"];
        set._evaluations = [];
        for (let evaluation of object["evaluations"]) {
            set._evaluations.push(Evaluation.deserialise(evaluation));
        }
        set._position = object["position"];
        set._current = set._evaluations[set._position];
        return set;
    }

    /**
     * Constructs and returns a new EvaluationSet from an EvaluationTemplate.
     *
     * @param id ID of the new EvaluationSet.
     * @param template The EvaluationTemplate that should be used.
     */
    public static fromTemplate(id : string, template: EvaluationTemplate) : EvaluationSet {
        let set = new EvaluationSet();
        set._id = id;
        set._template = template.uri;
        for (let i=0; i<template.numberOfScenarios(); i++) {
            set._evaluations.push(Evaluation.fromScenario(template.evaluationScenario(i)));
        }
        set._position = 0;
        set._current = set._evaluations[0];
        return set
    }
}