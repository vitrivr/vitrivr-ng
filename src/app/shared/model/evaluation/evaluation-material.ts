export class EvaluationMaterial {

  /** Name of the evaluation scenario. */
  private readonly _name: string;

  /** Description of the evaluation scenario. Can be HTML! */
  private readonly _description: string;

  /** URL to material */
  private readonly _url: string;

  /**
   *
   * @param name
   * @param description
   * @param url
   */
  constructor(name: string, description: string, url: string) {
    this._name = name;
    this._description = description;
    this._url = url;
  }

  /**
   * Getter for name.
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
   * Getter for URL.
   *
   * @return {string}
   */
  get url(): string {
    return this._url;
  }
}

