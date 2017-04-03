/**
 * QueryTerm types. If you want to add a new type, start by adding it here. For each type you must then provide a:
 *
 * - QueryTermInterface implementation
 * - QueryTermComponent implementation (see /app/research/components/)
 */
export type QueryTermType = "IMAGE" | "AUDIO" | "MOTION" | "MODEL";

/**
 * General interface of a QueryTerm.
 */
export interface QueryTermInterface {
    /**
     * List of retrieval categories that should be used as part of this query.
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