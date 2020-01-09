/** Supported hints for usage within a QueryConfig object. */
export type Hint = 'exact' | 'inexact';

/**
 * Defines the properties of a QueryConfig object, which can be sent alongside a Query to configure certain aspects of the query execution.
 */
export interface QueryConfig {
  queryId: string;
  hints: Hint[];
}
