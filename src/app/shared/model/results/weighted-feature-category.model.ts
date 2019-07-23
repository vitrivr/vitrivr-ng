/**
 * Represents a specific feature category as used by Cineast to facilitate search and retrieval.
 * Examples for categories are edge, localcolor, globalcolor
 */
import {ColorUtil} from '../../util/color.util';
import {FeatureCategories} from './feature-categories.model';

export class WeightedFeatureCategory {

    public displayColor: string;
    public weight: number;

    /**
     * Constructor for FeatureCategory
     *
     * @param name Name of the category.
     * @param readableName The human readable name of the category.
     * @param defaultWeight The default weight for the category.
     */
    public constructor(readonly name: FeatureCategories, readonly readableName: string, readonly defaultWeight: number) {
        this.displayColor = ColorUtil.randomColorHex();
        this.weight = defaultWeight;
    }

    /**
     * Calculates and returns the total weight of a list of FeatureCategory objects.
     *
     * @param features The list of results.
     */
    public static totalWeight(features: WeightedFeatureCategory[]): number {
        return features.map(f => f.weight).reduce((a, b) => a + b);
    }

    /**
     * Generates a string representation of the FeatureCategory object.
     *
     * @return {string}
     */
    toString(): string {
        return this.name;
    }
}
