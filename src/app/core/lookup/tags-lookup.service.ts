import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Tag} from '../../shared/model/misc/tag.model';
import {CineastRestAPI} from '../api/cineast-rest-api.service';
import {ConfigService} from '../basics/config.service';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {TagIDsElementResultInterface} from '../../shared/model/messages/interfaces/responses/tagids-element-result.interface';
import {TagQueryResult} from '../../shared/model/messages/interfaces/responses/tag-query-result.interface';

/**
 * This service provides access to the Tags stored and exposed by Cineast through the Cineast RESTful API. Tags can be
 * used for Tag based (boolean) lookup.
 */
@Injectable()
export class TagsLookupService extends CineastRestAPI {

  constructor(@Inject(ConfigService) _configService: ConfigService, @Inject(HttpClient) _httpClient: HttpClient) {
    super(_configService, _httpClient);
  }

  /**
   * This method returns a list of Tags matching the given filter predicate.
   *
   * @param {string} filter Filter predicate.
   */
  public matching(filter: string): Observable<Tag[]> {
    return this.get<TagQueryResult>('find/tags/by/matchingname/' + filter).pipe(first()).map(res => res.tags);
  }

  /**
   * Returns complete tag information for a list of ids
   */
  public getTagById(ids: string[]): Observable<Tag[]> {
    return this.post<TagQueryResult>('tags/by/id/', '{"ids":' + JSON.stringify(ids) + '}').pipe(first()).map(res => res.tags);
  }

  /**
   * Returns all stored tag ids for a specific element (object or segment)
   */
  public getTagIDsPerElementId(id: string): Observable<string[]> {
    return this.get<TagIDsElementResultInterface>('find/feature/tags/by/id/' + id).pipe(first()).map(res => res.tagIDs);
  }
}
