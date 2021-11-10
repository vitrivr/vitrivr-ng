import {QueryContainerInterface} from './interfaces/query-container.interface';
import {QueryTermInterface} from './interfaces/query-term.interface';
import {ImageQueryTerm} from './image-query-term.model';
import {AudioQueryTerm} from './audio-query-term.model';
import {M3DQueryTerm} from './m3d-query-term.model';
import {BoolQueryTerm} from './bool-query-term.model';
import {MotionQueryTerm} from './motion-query-term.model';
import {TextQueryTerm} from './text-query-term.model';
import {TagQueryTerm} from './tag-query-term.model';
import {SemanticQueryTerm} from './semantic/semantic-query-term.model';
import {QueryStage} from './query-stage.model';
import {QueryTerm} from '../../../../../openapi/cineast/model/queryTerm';
import {LocationQueryTerm} from './location-query-term.model';

export class StagedQueryContainer implements QueryContainerInterface {

  static i = 0

  /**
   * List of all stages within this staged query. If you do not wish to use staged querying, simply put all queryterms within one stage.
   */
  public readonly stages: QueryStage[] = [];

  /**
   * Internal cache for the queryterms. Since each queryterm can only occur once in the current implementation of vitrivr-ng, this is enough.
   */
  private _cache: Map<QueryTerm.TypeEnum, QueryTermInterface> = new Map();


  public constructor() {
    this.stages.push(new QueryStage());
  }

  public addTerm(type: QueryTerm.TypeEnum): boolean {
    if (this._cache.has(type)) {
      return false;
    }
    switch (type) {
      case QueryTerm.TypeEnum.IMAGE:
        this._cache.set(type, new ImageQueryTerm());
        break;
      case QueryTerm.TypeEnum.AUDIO:
        this._cache.set(type, new AudioQueryTerm());
        break;
      case QueryTerm.TypeEnum.MODEL3D:
        this._cache.set(type, new M3DQueryTerm());
        break;
      case QueryTerm.TypeEnum.MOTION:
        this._cache.set(type, new MotionQueryTerm());
        break;
      case QueryTerm.TypeEnum.TEXT:
        this._cache.set(type, new TextQueryTerm());
        break;
      case QueryTerm.TypeEnum.TAG:
        this._cache.set(type, new TagQueryTerm());
        break;
      case QueryTerm.TypeEnum.SEMANTIC:
        this._cache.set(type, new SemanticQueryTerm());
        break;
      case QueryTerm.TypeEnum.BOOLEAN:
        this._cache.set(type, new BoolQueryTerm());
        break;
      case QueryTerm.TypeEnum.LOCATION:
        this._cache.set(type, new LocationQueryTerm());
        break;
      default:
        return false;
    }
    if (this.stages.length === 0) {
      this.stages.push(new QueryStage());
    }
    /* We insert new queryterms at the lowest levels. */
    this.stages[this.stages.length - 1].terms.push(this._cache.get(type));
    return true;
  }

  public removeTerm(type: QueryTerm.TypeEnum): boolean {
    if (this._cache.has(type)) {
      this.stages.forEach(stage => {
        if (stage.terms.indexOf(this._cache.get(type)) > -1) {
          stage.terms.splice(stage.terms.indexOf(this._cache.get(type)), 1);
          /* if stage is now empty, clear it*/
          if (stage.terms.length === 0) {
            this.stages.splice(this.stages.indexOf(stage), 1);
          }
        }
      });
      return this._cache.delete(type)
    }
  }

  public hasTerm(type: QueryTerm.TypeEnum): boolean {
    return this._cache.has(type);
  }

  public getTerm(type: QueryTerm.TypeEnum): QueryTermInterface {
    return this._cache.get(type)
  }
}
