import {QueryTermInterface} from "./interfaces/query-term.interface";
import {QueryTermType} from "./interfaces/query-term-type.interface";

export abstract class AbstractQueryTerm implements QueryTermInterface {
    /** Base64 encoded audio data. */
    protected _data: string;

    /** Array with the active feature categories. */
    protected _categories : string[];

    /** Type of QueryTerm. */
    protected _type : QueryTermType;

    /**
     * Constructor for AbstractQueryTerm
     *
     * @param type Type of the QueryTerm
     * @param defaults Default categories
     */
    constructor(type: QueryTermType, defaults: string[] = []) {
        this._type = type;
        this._categories = defaults;
    }

    /**
     * Getter for type.
     *
     * @return {QueryTermType}
     */
    get type(): QueryTermType {
        return this._type;
    }

    /**
     * Getter for categories.
     *
     * @return {string[]}
     */
    get categories(): string[] {
        return this._categories;
    }

    /**
     * Getter for data.
     *
     * @return {string[]}
     */
    get data(): string {
        return this._data;
    }

    /**
     * Setter for data.
     *
     * @param {string} data
     */
    set data(data: string) {
        this._data = data;
    }

    /**
     * Adds a named query category to the QueryTerm. The implementation must make sure, that
     * the category is unique.
     *
     * @param {string} category
     */
    public pushCategory(category: string) {
        let index : number = this._categories.indexOf(category);
        if (index == -1) {
            this._categories.push(category);
        }
    }

    /**
     * Removes a named query category to the QueryTerm. The implementation must make sure, that
     * the category is unique.
     *
     * @param {string} category
     */
    public removeCategory(category: string) {
        let index : number = this._categories.indexOf(category);
        if (index > -1) {
            this._categories.splice(index, 1);
        }
    }

    /**
     * Replaces all the existing categories by the provided categories.
     *
     * @param {string} categories
     */
    public setCategories(categories: string[]) {
        this._categories = [];
        for (let category of categories) {
            this._categories.push(category);
        }
    }
}