export class TagOcurrenceModel {
  /**
   * Construtor for a TagOcurrenceModel.
   *
   * @param {string} id ID of the tag.
   * @param {String} name Name of the tag.
   * @param {string} occurrence Number of occurrences of the tag.
   */
  constructor(public readonly id: string, public readonly name: String, public readonly description: string, public readonly preference: string) {
  }
}
