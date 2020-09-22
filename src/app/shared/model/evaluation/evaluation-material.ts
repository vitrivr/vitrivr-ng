export class EvaluationMaterial {
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

  /** Name of the evaluation scenario. */
  private _name: string;

  /**
   * Getter for name.
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

  /** URL to material */
  private _url: string;

  /**
   * Getter for URL.
   *
   * @return {string}
   */
  get url(): string {
    return this._url;
  }
}

