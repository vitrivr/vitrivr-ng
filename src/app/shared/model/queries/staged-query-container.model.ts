import {QueryContainerInterface} from './interfaces/query-container.interface';
import {QueryTermInterface} from './interfaces/query-term.interface';
import {ImageQueryTerm} from './image-query-term.model';
import {AudioQueryTerm} from './audio-query-term.model';
import {M3DQueryTerm} from './m3d-query-term.model';
import {BoolQueryTerm} from './bool-query-term.model';
import {TextQueryTerm} from './text-query-term.model';
import {TagQueryTerm} from './tag-query-term.model';
import {SkeletonPoseQueryTerm} from "./skeleton-pose-query-term.model";
import {SemanticQueryTerm} from './semantic/semantic-query-term.model';
import {QueryStage} from './query-stage.model';
import {QueryTerm} from '../../../../../openapi/cineast/model/queryTerm';
import {LocationQueryTerm} from './location-query-term.model';
import {AppConfig} from '../../../app.config';

export class StagedQueryContainer implements QueryContainerInterface {

  static i = 0

  /**
   * List of all stages within this staged query. If you do not wish to use staged querying, simply put all queryterms within one stage.
   */
  public readonly stages: QueryStage[] = [];

  /**
   * Internal cache for the queryterms. Since each queryterm can only occur once in the current implementation of vitrivr-ng, this is enough.
   */
  //private _cache: Map<QueryTerm.TypeEnum, QueryTermInterface> = new Map();


  public constructor(private textCategories: string[][]) {
    this.stages.push(new QueryStage());
  }

  public addTerm(type: QueryTerm.TypeEnum): boolean {
    // if (this._cache.has(type)) {
    //   return false;
    // }
    if (this.hasTerm(type)) {
      return false;
    }

    let newStages = new Array<QueryTermInterface>();

    switch (type) {
      case QueryTerm.TypeEnum.Image:
        //this._cache.set(type, new ImageQueryTerm());
          newStages.push(new ImageQueryTerm());
        break;
      case QueryTerm.TypeEnum.Audio:
        // this._cache.set(type, new AudioQueryTerm());
        newStages.push(new AudioQueryTerm());
        break;
      case QueryTerm.TypeEnum.Model3D:
        // this._cache.set(type, new M3DQueryTerm());
        newStages.push(new M3DQueryTerm());
        break;
      case QueryTerm.TypeEnum.Text:
        // this._cache.set(type, new TextQueryTerm());
        for (let j = 0; j < this.textCategories.length; j++) {
          newStages.push(new TextQueryTerm(this.textCategories[j][1], this.textCategories[j][0]));
        }
        break;
      case QueryTerm.TypeEnum.Tag:
        // this._cache.set(type, new TagQueryTerm());
        newStages.push(new TagQueryTerm());
        break;
      case QueryTerm.TypeEnum.Semantic:
        // this._cache.set(type, new SemanticQueryTerm());
        newStages.push(new SemanticQueryTerm());
        break;
      case QueryTerm.TypeEnum.Boolean:
        // this._cache.set(type, new BoolQueryTerm());
        newStages.push(new BoolQueryTerm());
        break;
      case QueryTerm.TypeEnum.Location:
        // this._cache.set(type, new LocationQueryTerm());
        newStages.push(new LocationQueryTerm());
        break;
      case QueryTerm.TypeEnum.Skeleton:
        // this._cache.set(type, new SkeletonPoseQueryTerm());
        newStages.push(new SkeletonPoseQueryTerm());
        break;
      default:
        return false;
    }
    if (this.stages.length === 0) {
      this.stages.push(new QueryStage());
    }
    /* We insert new queryterms at the lowest levels. */
    newStages.forEach(s => this.stages[this.stages.length - 1].terms.push(s));
    return true;
  }

  public removeTerm(type: QueryTerm.TypeEnum): boolean {
    //if (this._cache.has(type)) {
    let changed = false;
      this.stages.forEach(stage => {
        while (true) { //(stage.terms.indexOf(this._cache.get(type)) > -1) {
          let index = stage.terms.findIndex(t => t.type == type)
          if (index <= -1) {
            break;
          }
          stage.terms.splice(index, 1);
          changed = true;
          /* if stage is now empty, clear it*/
          if (stage.terms.length === 0) {
            this.stages.splice(this.stages.indexOf(stage), 1);
          }
        }
      });
      return changed;
    //}
  }

  public hasTerm(type: QueryTerm.TypeEnum): boolean {
    for (let i = 0; i < this.stages.length; ++i) {
      if(this.stages[i].terms.findIndex(t => t.type == type) > -1) {
        return true;
      }
    }
    return false;
    //return this._cache.has(type);
  }

  // public getTerm(type: QueryTerm.TypeEnum): QueryTermInterface {
  //   return this._cache.get(type)
  // }
}
