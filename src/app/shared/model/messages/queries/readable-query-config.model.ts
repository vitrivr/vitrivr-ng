import {Hint, QueryConfig} from "../interfaces/requests/query-config.interface";

export class ReadableQueryConfig implements QueryConfig {
    /**
     * Constructor for ReadableQueryConfig.
     *
     * @param {string} queryId Query ID. If provided, this usually means that results will be appended to an existing result set.
     * @param {Hint[]} hints List of query hint.
     */
    constructor(public readonly queryId: string = null, public readonly hints: Hint[] = []) {}
}