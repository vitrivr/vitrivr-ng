export class Tag {
  /** Optional variable for aggregate statistics: could mention how many times a tag has occured*/
  public count: number;

  /** Optional variable indicating user preference */
  public preference: Preference;

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

export enum Preference {
  COULD = 'could',
  MUST = 'must',
  NOT = 'not'
}

