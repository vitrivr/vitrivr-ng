import {ImageQueryTerm} from "../image-query-term.model";
import {AudioQueryTerm} from "../audio-query-term.model";

/**
 *
 */
export interface QueryContainerInterface {
    imageQueryTerm :  ImageQueryTerm;
    audioQueryTerm : AudioQueryTerm;
}