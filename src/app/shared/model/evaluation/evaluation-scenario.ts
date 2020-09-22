import {EvaluationMaterial} from './evaluation-material';

export class EvaluationScenario {


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

  /** Default K value to calculate p@K and number of items a user is supposed to rate. */
  private _id: string;

  /**
   * Getter for description.
   *
   * @return {string}
   */
  get id(): string {
    return this._id;
  }

  /** Name of the evaluation scenario. */
  private _name: string;

  /**
   * Getter for description.
   *
   * @return {string}
   */
  get name(): string {
    return this._name;
  }

  /** Description of the evaluation scenario. Can be HTML! */
  private _description: string;

  /**
   * Getter for description.
   *
   * @return {string}
   */
  get description(): string {
    return this._description;
  }

  /** Default K value to calculate p@K and number of items a user is supposed to rate. */
  private _k: number = 15;

  /**
   * Getter for K.
   *
   * @return {number}
   */
  get k(): number {
    return this._k;
  }

  /** Array containing the material that can be used to fulfill the scenario. */
  private _material: EvaluationMaterial[] = [];

  /**
   * Getter for material.
   *
   * @return {EvaluationMaterial[]}
   */
  get material(): EvaluationMaterial[] {
    return this._material;
  }

  /** Array containing the material that can is used as illustration. */
  private _illustrations: EvaluationMaterial[] = [];

  /**
   * Getter for illustrations
   *
   * @return {EvaluationMaterial[]}
   */
  get illustrations(): EvaluationMaterial[] {
    return this._illustrations;
  }
}
