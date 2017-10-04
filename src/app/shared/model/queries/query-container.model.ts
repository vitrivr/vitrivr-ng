import {QueryContainerInterface} from "./interfaces/query-container.interface";
import {QueryTermInterface} from "./interfaces/query-term.interface";
import {ImageQueryTerm} from "./image-query-term.model";
import {AudioQueryTerm} from "./audio-query-term.model";
import {M3DQueryTerm} from "./m3d-query-term.model";
import {QueryTermType} from "./interfaces/query-term-type.interface";
import {MotionQueryTerm} from "./motion-query-term.model";
import {TextQueryTerm} from "./text-query-term.model";

export class QueryContainer implements QueryContainerInterface {
    /**
     *
     * @type {Array}
     */
    private terms_map: Map<QueryTermType, QueryTermInterface> = new Map();

    /**
     *
     * @type {Array}
     */
    private _terms: QueryTermInterface[] = [];

    /**
     *
     * @param type
     */
    public addTerm(type: QueryTermType): boolean {
        if (this.terms_map.has(type)) return false;
        switch (type) {
            case "IMAGE":
                this.terms_map.set(type, new ImageQueryTerm());
                break;
            case "AUDIO":
                this.terms_map.set(type, new AudioQueryTerm());
                break;
            case "MODEL3D":
                this.terms_map.set(type, new M3DQueryTerm());
                break;
            case "MOTION":
                this.terms_map.set(type, new MotionQueryTerm());
                break;
            case "TEXT":
                this.terms_map.set(type, new TextQueryTerm());
                break;
            default:
                return false;
        }
        this._terms.push(this.terms_map.get(type));
        return true;
    }

    /**
     *
     * @param type
     * @returns {boolean}
     */
    public removeTerm(type: QueryTermType): boolean {
        if (this.terms_map.has(type)) {
            this._terms.splice(this._terms.indexOf(this.terms_map.get(type)), 1);
            return this.terms_map.delete(type)
        }
    }

    /**
     *
     * @param type
     * @returns {boolean}
     */
    public hasTerm(type: QueryTermType): boolean {
        return this.terms_map.has(type);
    }

    /**
     *
     * @param type
     * @returns {boolean}
     */
    public getTerm(type: QueryTermType): QueryTermInterface {
        return this.terms_map.get(type)
    }

    /**
     * Returns a JSON object representing the current QueryTermInterface instance.
     */
    public toJson(): any {
        return {terms : this._terms.map(t => { return t.toJson() })};
    }
}