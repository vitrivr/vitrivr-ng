export class Tag {
  /**
   * Construtor for a Tag.
   *
   * @param {string} id ID of the tag.
   * @param {String} name Name of the tag.
   * @param {string} description Description of the tag.
   * @param {string} preference of the tag: 'must', 'could', 'not'
   */
  public occurrence: number;
  public preference: string;

  constructor(public readonly id: string, public readonly name: String, public readonly description: string) {
  }

}
