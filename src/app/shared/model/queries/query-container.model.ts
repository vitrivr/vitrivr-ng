import {QueryContainerInterface} from "./interfaces/query-container.interface";
import {QueryTermInterface, QueryTermType} from "./interfaces/query-term.interface";
import {ImageQueryTerm} from "./image-query-term.model";
import {AudioQueryTerm} from "./audio-query-term.model";
import {M3DQueryTerm} from "./m3d-query-term.model";


export class QueryContainer implements QueryContainerInterface {
    /**
     *
     * @type {Array}
     */
    private _terms: Map<QueryTermType, QueryTermInterface> = new Map();

    /**
     *
     * @type {Array}
     */
    private terms: QueryTermInterface[] = [];

    /**
     *
     * @param type
     */
    public addTerm(type: QueryTermType): boolean {
        if (this._terms.has(type)) return false;
        switch (type) {
            case "IMAGE":
                this._terms.set(type, new ImageQueryTerm());
                break;
            case "AUDIO":
                this._terms.set(type, new AudioQueryTerm());
                break;
            case "MODEL":
                this._terms.set(type, new M3DQueryTerm());
                break;
            default:
                return false;
        }
        this.terms.push(this._terms.get(type));
        return true;
    }

    /**
     *
     * @param type
     * @returns {boolean}
     */
    public removeTerm(type: QueryTermType): boolean {
        if (this._terms.has(type)) {
            this.terms.splice(this.terms.indexOf(this._terms.get(type)), 1);
            return this._terms.delete(type)
        }
    }

    /**
     *
     * @param type
     * @returns {boolean}
     */
    public hasTerm(type: QueryTermType): boolean {
        return this._terms.has(type);
    }

    /**
     *
     * @param type
     * @returns {boolean}
     */
    public getTerm(type: QueryTermType): QueryTermInterface {
        return this._terms.get(type)
    }
}