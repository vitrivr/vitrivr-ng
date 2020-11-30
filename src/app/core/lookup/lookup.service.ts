import {Inject, Injectable, setTestabilityGetter} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CineastRestAPI} from '../api/cineast-rest-api.service';
import {ConfigService} from '../basics/config.service';
import {Observable} from 'rxjs';
import {MetadataQueryResult} from '../../shared/model/messages/interfaces/responses/metadata-query-result.interface';
import {first} from 'rxjs/operators';
import {Tag} from '../../shared/model/misc/tag.model';
import {TagQueryResult} from '../../shared/model/messages/interfaces/responses/tag-query-result.interface';
import {TagIDsElementResultInterface} from '../../shared/model/messages/interfaces/responses/tagids-element-result.interface';
import {FeaturesTextCategoryCategoryResult} from '../../shared/model/messages/interfaces/responses/feature-text-category-result.interface';
import {MediaObject} from '../../shared/model/media/media-object.model';
import {MediaObjectQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-object.interface';
import {MediaSegmentQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-segment.interface';

/**
 * This service provides access to the REST API of Cineast
 */
@Injectable()
export class LookupService extends CineastRestAPI {

  constructor(@Inject(ConfigService) _configService: ConfigService, @Inject(HttpClient) _httpClient: HttpClient) {
    super(_configService, _httpClient);
  }

  /**
   * This method returns a list of Metadata for the given objectId predicate.
   *
   * @param {string} objectId ID of the MediaObject for which to lookup MediaObjectMetadata.
   */
  public lookup(objectId: string): Observable<MetadataQueryResult> {
    return this.get<MetadataQueryResult>('find/metadata/by/id/' + objectId).pipe(
      first()
    );
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
    return this.get<TagIDsElementResultInterface>('find/segment/tags/by/id/' + id).pipe(first()).map(res => (res as any).featureValues);
  }

  public getCaptions(id: string): Observable<FeaturesTextCategoryCategoryResult> {
    return this.getText(id, 'captions')
  }

  public getText(id: string, category: string): Observable<FeaturesTextCategoryCategoryResult> {
    return this.get<FeaturesTextCategoryCategoryResult>(`find/segment/${category}/by/id/${id}` ).pipe(
      first()
    );
  }

  public getAsr(id: string): Observable<FeaturesTextCategoryCategoryResult> {
    return this.getText(id, 'asr');
  }

  public getOcr(id: string): Observable<FeaturesTextCategoryCategoryResult> {
    return this.getText(id, 'ocr');
  }

  /**
   * the {@link MediaObjectQueryResult#content} should just have one element in it
   * @param id objectid
   */
  public getMultimediaObject(id: string): Observable<MediaObjectQueryResult> {
    return this.get<MediaObjectQueryResult>('find/object/by/id/' + id).pipe(
      first()
    );
  }

  /**
   * the {@link MediaSegmentQueryResult#content} should just have one element in it
   * @param id segmentid
   */
  public getMultimediaSegment(id: string): Observable<MediaSegmentQueryResult> {
    return this.get<MediaSegmentQueryResult>('find/segments/by/id/' + id).pipe(
      first()
    );
  }

  public getMultimediaSegmentsByObjectId(objectId: string): Observable<MediaSegmentQueryResult> {
    return this.get<MediaSegmentQueryResult>('find/segments/all/object/' + objectId).pipe(first())
  }

}


