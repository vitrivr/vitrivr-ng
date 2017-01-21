/**
 *
 */
export interface QueryTermInterface {
    weight : number;
    categories : string[];
    setting(setting : number) : void;
}