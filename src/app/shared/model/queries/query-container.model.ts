import {QueryContainerInterface} from "./interfaces/query-container.interface";
import {QueryTermInterface} from "./interfaces/query-term.interface";
import {ImageQueryTerm} from "./image-query-term.model";
import {AudioQueryTerm} from "./audio-query-term.model";
import {M3DQueryTerm} from "./m3d-query-term.model";
import {QueryTermType} from "./interfaces/query-term-type.interface";
import {MotionQueryTerm} from "./motion-query-term.model";
import {TextQueryTerm} from "./text-query-term.model";
import {TagQueryTerm} from "./tag-query-term.model";

export class QueryContainer implements QueryContainerInterface {
    /**
     * List of QueryTerms contained within this QueryContainer.
     *
     * @type {QueryTermInterface[]}
     */
    public readonly terms: QueryTermInterface[] = [];

    /**
     * Internal map of QueryTermType to QueryTermInterface.
     *
     * @type {Map<QueryTermType, QueryTermInterface>}
     */
    private _terms_map: Map<QueryTermType, QueryTermInterface> = new Map();

    /**
     * Adds a new QueryTerm for the specified QueryTermType.
     *
     * @param type The QueryTermType of the new QueryTerm.
     * @returns {boolean} True if QueryTerm was added, false otherwise
     */
    public addTerm(type: QueryTermType): boolean {
        if (this._terms_map.has(type)) return false;
        switch (type) {
            case "IMAGE":
                this._terms_map.set(type, new ImageQueryTerm());
                break;
            case "AUDIO":
                this._terms_map.set(type, new AudioQueryTerm());
                break;
            case "MODEL3D":
                this._terms_map.set(type, new M3DQueryTerm());
                break;
            case "MOTION":
                this._terms_map.set(type, new MotionQueryTerm());
                break;
            case "TEXT":
                this._terms_map.set(type, new TextQueryTerm());
                break;
            case "TAG":
                this._terms_map.set(type, new TagQueryTerm());
                break;
            default:
                return false;
        }
        this.terms.push(this._terms_map.get(type));
        return true;
    }

    /**
     * Removes the QueryTerm instance associated with the given QueryTermType.
     *
     * @param type The QueryTermType of the QueryTerm that should be removed.
     * @returns {boolean} True if QueryTerm was removed, false otherwise
     */
    public removeTerm(type: QueryTermType): boolean {
        if (this._terms_map.has(type)) {
            this.terms.splice(this.terms.indexOf(this._terms_map.get(type)), 1);
            return this._terms_map.delete(type)
        }
    }

    /**
     * Determines whether the current QueryContainer has an instance of a QueryTerm for the given QueryTermType.
     *
     * @param type The QueryTermType
     * @returns {boolean} True if QueryTerm was created, false otherwise.
     */
    public hasTerm(type: QueryTermType): boolean {
        return this._terms_map.has(type);
    }

    /**
     *
     * @param type
     * @returns {boolean}
     */
    public getTerm(type: QueryTermType): QueryTermInterface {
        return this._terms_map.get(type)
    }
}