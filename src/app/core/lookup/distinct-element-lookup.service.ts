import {Inject, Injectable} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';
import {first} from 'rxjs/operators';
import {MiscService} from '../../../../openapi/cineast';

/**
 * This service provides access to the Tags stored and exposed by Cineast through the Cineast RESTful API. Tags can be
 * used for Tag based (boolean) lookup.
 *
 * This is a proxy service since it applies basic caching mechanism.
 */
@Injectable()
export class DistinctElementLookupService {

  private cache = {};

  private cacheAll = [];

  constructor(@Inject(MiscService) private _miscService: MiscService) {
  }

  /**
   * Returns all distinct strings for a given column.
   */
  public getDistinct(table: string, column: string): Observable<string[]> {
    if (this.cache[table + column]) {
      return new BehaviorSubject(this.cache[table + column])
    }
    return this._miscService.findDistinctElementsByColumn({table: table, column: column}).pipe(first()).map(res => {
      this.cache[table + column] = res.distinctElements;
      return res.distinctElements
    });
  }
    /**
     * Returns all the posible values for a Range Retriever
     */
    public getAllElements(table: string, column: string): Observable<string[]> {
        if (this.cacheAll[table + column]) {
            console.log(this.cacheAll);
            return new BehaviorSubject(this.cache[table + column])
        }
        return this._miscService.findAllElements(table, column).pipe(first()).map(res => {
            this.cacheAll[table + column] = res.content;
            return res.content
        });
    }
}
