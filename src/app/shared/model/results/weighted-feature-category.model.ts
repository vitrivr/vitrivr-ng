/**
 * Represents a specific feature category as used by Cineast to facilitate search and retrieval.
 * Examples for categories are edge, localcolor, globalcolor
 */
import {ColorUtil} from '../../util/color.util';
import {FeatureCategories} from './feature-categories.model';

export class WeightedFeatureCategory {

  public displayColor: string;
  /** From 0 to 1 */
  public weightPercentage: number;

  /**
   * Constructor for FeatureCategory
   *
   * @param name Name of the category.
   * @param readableName The human readable name of the category.
   * @param defaultWeight The default weightPercentage for the category.
   */
  public constructor(readonly name: FeatureCategories, readonly readableName: string, readonly defaultWeight: number) {
    this.displayColor = ColorUtil.randomColorHex();
    this.weightPercentage = defaultWeight;
  }

  /**
   * Generates a string representation of the FeatureCategory object.
   *
   * @return {string}
   */
  toString(): string {
    return this.name + ':' + this.weightPercentage;
  }
}
