import {QueryTermType} from "./query-term-type.interface";

/**
 * General interface of a QueryTerm.
 */
export interface QueryTermInterface {
    /**
     * List of retrieval categories that should be used as part of this findSimilar.
     */
    categories : string[];

    /**
     * String representation of the data. This could be a base64 encoded image or audio stream.
     */
    data: string;

    /**
     * Type of QueryTerm. Must correspond to one the types defined above.
     */
    type: QueryTermType

    /**
     * Updates the categories based on a numeric value. How this is being done is specific
     * to the implementation.
     *
     * @param setting
     */
    setting(setting : number) : void;
}