import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CineastRestAPI} from '../api/cineast-rest-api.service';
import {ConfigService} from '../basics/config.service';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {FeaturesTextCategoryCategoryResult} from '../../shared/model/messages/interfaces/responses/feature-text-category-result.interface';

/**
 * This service provides access to the features stored and exposed by Cineast through the Cineast RESTful API.
 */
@Injectable()
export class FeatureLookupService extends CineastRestAPI {

  constructor(@Inject(ConfigService) _configService: ConfigService, @Inject(HttpClient) _httpClient: HttpClient) {
    super(_configService, _httpClient);
  }

  public getCaptions(id: string): Observable<FeaturesTextCategoryCategoryResult> {
    return this.getText(id, 'scenecaption')
  }

  public getText(id: string, category: string): Observable<FeaturesTextCategoryCategoryResult> {
    return this.get<FeaturesTextCategoryCategoryResult>('find/feature/text/by/' + id + '/' + category).pipe(
      first()
    );
  }

  public getAsr(id: string): Observable<FeaturesTextCategoryCategoryResult> {
    return this.getText(id, 'asr');
  }

  public getOcr(id: string): Observable<FeaturesTextCategoryCategoryResult> {
    return this.getText(id, 'ocr');
  }


}


