import {QueryTermInterface} from "./interfaces/query-term.interface";
import {QueryTermType} from "./interfaces/query-term-type.interface";

export abstract class AbstractQueryTerm implements QueryTermInterface {
    /** Base64 encoded audio data. */
    public data: string;

    /**
     * Constructor for AbstractQueryTerm
     *
     * @param type Type of the QueryTerm
     * @param categories Default categories
     */
    constructor(public readonly type: QueryTermType, public readonly categories: string[] = []) {}

    /**
     * Adds a named query category to the QueryTerm. The implementation must make sure, that
     * the category is unique.
     *
     * @param {string} category
     */
    public pushCategory(category: string) {
        let index : number = this.categories.indexOf(category);
        if (index == -1) {
            this.categories.push(category);
        }
    }

    /**
     * Returns true if QueryTerm contains specified category and false otherwise.
     *
     * @param {string} category Category that should be checked,
     * @return {boolean} True if category is contained, else false.
     */
    public hasCategory(category: string): boolean {
        return (this.categories.indexOf(category) > -1);
    }

    /**
     * Removes a named query category to the QueryTerm. The implementation must make sure, that
     * the category is unique.
     *
     * @param {string} category
     */
    public removeCategory(category: string) {
        let index : number = this.categories.indexOf(category);
        if (index > -1) {
            this.categories.splice(index, 1);
        }
    }

    /**
     * Replaces all the existing categories by the provided categories.
     *
     * @param {string} categories
     */
    public setCategories(categories: string[]) {
        this.categories.splice(0, this.categories.length);
        for (let category of categories) {
            this.categories.push(category);
        }
    }
}