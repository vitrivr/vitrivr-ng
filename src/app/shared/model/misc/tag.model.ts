export class Tag {
  /**
   * Construtor for a Tag.
   *
   * @param {string} id ID of the tag.
   * @param {String} name Name of the tag.
   * @param {string} description Description of the tag.
   */
  constructor(public readonly id: string, public readonly name: String, public readonly description: string) {
  }
}
