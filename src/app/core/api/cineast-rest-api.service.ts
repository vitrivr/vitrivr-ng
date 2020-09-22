import {Inject} from '@angular/core';
import {ConfigService} from '../basics/config.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

/**
 * Class that can be extended or used by services that provide access to some kind of RESTful endpoint exposed by Cineast.
 */
export class CineastRestAPI {
  /** URL to the RESTful endpoint. */
  private _endpoint: string;

  /**
   * Constructor for CineastRestAPI.
   *
   * @param {ConfigService} _configService
   * @param {HttpClient} _httpClient
   */
  constructor(@Inject(ConfigService) _configService: ConfigService, @Inject(HttpClient) protected _httpClient: HttpClient) {
    _configService.asObservable().pipe(
      filter(c => c.endpoint_http != null)
    ).subscribe((config) => {
      this._endpoint = config.endpoint_http;
    });
  }

  /**
   * Invokes a named service using HTTP GET. The path to the service must be relative to the API endpoint.
   *
   * e.g. Path: /find/by/id
   *
   * @param {string} service The path to the service.
   * @param parameters Optional query parameters.
   * @return Observable<T>
   */
  public get<T>(service: string, parameters?: HttpParams | { [param: string]: string | string[]; }): Observable<T> {
    return this._httpClient.get<T>(this.resolve(service), {observe: 'body', responseType: 'json', params: parameters})
  }

  /**
   *
   * @param {string} service
   * @param body
   * @param parameters
   */
  /**
   * Invokes a named service using HTTP POST. The path to the service must be relative to the API endpoint.
   *
   * e.g. Path: /find/by/id
   *
   * @param {string} service The path to the service.
   * @param {object} body The body that will be submitted with the POST request.
   * @param parameters Optional (GET) query parameters.
   * @return Observable<T>
   */
  public post<T>(service: string, body: any, parameters?: HttpParams | { [param: string]: string | string[]; }): Observable<T> {
    return this._httpClient.post<T>(this.resolve(service), body, {observe: 'body', responseType: 'json', params: parameters})
  }

  /**
   * Helper method used to resolve a service relative to the endpoint.
   *
   * @param {string} service  The path to the service.
   * @return {string} Full URL to the service.
   */
  private resolve(service: string): string {
    return this._endpoint + service;
  }
}
