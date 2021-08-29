export class ColorUtil {
  /**
   * Converts the given HSV colour values to rgb, returning a tuple.
   *
   * @param {number} h Hue value
   * @param {number} s Saturation value
   * @param {number} v Value
   * @return Tuple containing the RGB values.
   */
  public static hsvToRgb(h: number, s: number, v: number): ([number, number, number] | number[]) {
    if (h < 0 || h > 360) {
      throw new Error('Hue must be between 0 and 360 degree.');
    }
    if (s < 0 || s > 1) {
      throw new Error('Saturation must be between 0 and 1.');
    }
    if (v < 0 || v > 1) {
      throw new Error('Value must be between 0 and 1.');
    }

    const C = v * s;
    const X = C * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - C;

    const rgbp: [number, number, number] = [0, 0, 0];
    if (h < 60) {
      rgbp[0] = C;
      rgbp[1] = X;
    } else if (h < 120) {
      rgbp[0] = X;
      rgbp[1] = C;
    } else if (h < 180) {
      rgbp[1] = C;
      rgbp[2] = X;
    } else if (h < 240) {
      rgbp[1] = X;
      rgbp[2] = C;
    } else if (h < 300) {
      rgbp[0] = X;
      rgbp[2] = C;
    } else if (h < 360) {
      rgbp[0] = C;
      rgbp[2] = X;
    }
    return rgbp.map(v => Math.round((v + m) * 255.0));
  }


  /**
   * Converts the given RGB colour value to hex representation and returns it.
   *
   * @param r Red value between 0 and 255
   * @param g Green value between 0 and 255
   * @param b Blue value between 0 and 255
   *
   * @return {string} Hex representation.
   */
  public static rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Generates and returns a random RGB colour in the hex representation.
   *
   * @returns {string} Colour string.
   */
  public static randomColorHex(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color
  }


  /**
   * Generates a color on the 'jet' color palette
   * @param v value between 0 and 1
   */
  public static jet(v: number): string {
    // return clamp(vec3(1.5) - abs(4.0 * vec3(v) + vec3(-3, -2, -1)), vec3(0), vec3(1));
    return ColorUtil.rgbToHex(
      255 * Math.min(1.0, Math.max(0.0, 1.5 - Math.abs(4.0 * v - 3))),
      255 * Math.min(1.0, Math.max(0.0, 1.5 - Math.abs(4.0 * v - 2))),
      255 * Math.min(1.0, Math.max(0.0, 1.5 - Math.abs(4.0 * v - 1)))
    );
  }


}
