import {EvaluationMaterial} from "./evaluation-material";
export class EvaluationScenario {


    /** Default K value to calculate p@K and number of items a user is supposed to rate. */
    private _id : string;

    /** Name of the evaluation scenario. */
    private _name : string;

    /** Description of the evaluation scenario. Can be HTML! */
    private _description : string;

    /** Default K value to calculate p@K and number of items a user is supposed to rate. */
    private _k : number = 15;

    /** Array containing the material that can be used to fulfill the scenario. */
    private _material: EvaluationMaterial[] = [];

    /** Array containing the material that can is used as illustration. */
    private _illustrations: EvaluationMaterial[] = [];

    /**
     *
     * @param id
     * @param name
     * @param description
     * @param k
     * @param illustrations
     * @param material
     */
    constructor(id, name, description, k, illustrations, material) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._k = k;
        this._illustrations = illustrations;
        this._material = material;
    }

    /**
     * Getter for description.
     *
     * @return {string}
     */
    get id(): string {
        return this._id;
    }

    /**
     * Getter for K.
     *
     * @return {number}
     */
    get k(): number {
        return this._k;
    }

    /**
     * Getter for description.
     *
     * @return {string}
     */
    get name(): string {
        return this._name;
    }

    /**
     * Getter for description.
     *
     * @return {string}
     */
    get description(): string {
        return this._description;
    }

    /**
     * Getter for illustrations
     *
     * @return {EvaluationMaterial[]}
     */
    get illustrations(): EvaluationMaterial[] {
        return this._illustrations;
    }

    /**
     * Getter for material.
     *
     * @return {EvaluationMaterial[]}
     */
    get material(): EvaluationMaterial[] {
        return this._material;
    }
}