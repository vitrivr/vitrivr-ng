import {QueryTermInterface} from "./query-term.interface";
import {QueryTermType} from "./query-term-type.interface";

/**
 *
 */
export interface QueryContainerInterface {
    addTerm(type: QueryTermType): boolean;
    removeTerm(type: QueryTermType): boolean;
    hasTerm(type: QueryTermType): boolean;
    getTerm(type: QueryTermType): QueryTermInterface;
}