import {QueryTermInterface, QueryTermType} from "./query-term.interface";

/**
 *
 */
export interface QueryContainerInterface {
    addTerm(type: QueryTermType): boolean;
    removeTerm(type: QueryTermType): boolean;
    hasTerm(type: QueryTermType): boolean;
    getTerm(type: QueryTermType): QueryTermInterface;
}