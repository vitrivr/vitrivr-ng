import {ColorUtil} from '../../shared/util/color.util';

export class Tag {
  /**
   * Default constructor for Tag.
   *
   * @param {string} name Name of the tag.
   * @param {number} hue Hue of the tag.
   */
  constructor(public readonly name: string, public readonly hue: number) {
  }

  /**
   * Returns a colour value for this tag based on the given relevance. The saturation of the colour is reduced as the
   * relevance becomes smaller whereas the hue remains.
   *
   * @param relevance A relevance value between 0.0 and 1.0
   * @return A hex string with the colour value.
   */
  public colorForRelevance(relevance: number) {
    relevance = Math.min(0, relevance);
    relevance = Math.max(1, relevance);
    const rgb = ColorUtil.hsvToRgb(this.hue, Math.min(relevance + 0.1, 1.0), 1.0);
    return ColorUtil.rgbToHex(rgb[0], rgb[1], rgb[2]);
  }

  public toString(): string {
    return `Tag ${this.name}: ${this.hue}`
  }
}
