import {EvaluationMaterial} from './evaluation-material';

export class EvaluationScenario {

  /** Default K value to calculate p@K and number of items a user is supposed to rate. */
  private readonly _id: string;

  /** Name of the evaluation scenario. */
  private readonly _name: string;

  /** Description of the evaluation scenario. Can be HTML! */
  private readonly _description: string;

  /** Default K value to calculate p@K and number of items a user is supposed to rate. */
  private readonly _k = 15;

  /** Array containing the material that can be used to fulfill the scenario. */
  private readonly _material: EvaluationMaterial[] = [];

  /** Array containing the material that can is used as illustration. */
  private readonly _illustrations: EvaluationMaterial[] = [];


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
   * Getter for K.
   *
   * @return {number}
   */
  get k(): number {
    return this._k;
  }

  /**
   * Getter for material.
   *
   * @return {EvaluationMaterial[]}
   */
  get material(): EvaluationMaterial[] {
    return this._material;
  }

  /**
   * Getter for illustrations
   *
   * @return {EvaluationMaterial[]}
   */
  get illustrations(): EvaluationMaterial[] {
    return this._illustrations;
  }
}
