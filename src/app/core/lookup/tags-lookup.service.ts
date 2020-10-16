import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Tag} from '../../shared/model/misc/tag.model';
import {CineastRestAPI} from '../api/cineast-rest-api.service';
import {ConfigService} from '../basics/config.service';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';

/**
 * This service provides access to the Tags stored and exposed by Cineast through the Cineast RESTful API. Tags can be
 * used for Tag based (boolean) lookup.
 */
@Injectable()
export class TagsLookupService extends CineastRestAPI {
  /**
   * Constructor.
   *
   * @param {ConfigService} _configService
   * @param {HttpClient} _httpClient
   */
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

  public getTagById(id: string): Tag {
    return this.get<TagQueryResult>('find/tags/by/id/' + id).pipe(first()).map(res => res.tags)[0];
  }
}

class TagQueryResult {
  public queryId: string;
  public tags: Tag[];
}
