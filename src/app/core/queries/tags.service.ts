import {Inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Tag} from "../../shared/model/misc/tag.model";
import {CineastRestAPI} from "../api/cineast-rest-api.service";
import {ConfigService} from "../basics/config.service";
import {Observable} from "rxjs/Observable";
import {observable} from "rxjs/symbol/observable";

/**
 * This service provides access to the Tags stored and exposed by Cineast through the Cineast RESTful API. Tags can be
 * used for Tag based (boolean) lookup.
 */
@Injectable()
export class TagsService extends CineastRestAPI {
   /**
     * Constructor.
    * 
     * @param {ConfigService} _configService
     * @param {HttpClient} _httpClient
     */
    constructor(@Inject(ConfigService) _configService : ConfigService, @Inject(HttpClient) _httpClient: HttpClient) {
        super(_configService, _httpClient);
    }

    /**
     * This method returns a list of Tags matching the given filter predicate.
     *
     * @param {string} filter Filter predicate.
     */
    public matching(filter: string): Observable<Tag[]> {
        return this.get<Tag[]>("find/tags/by/matchingname/" + filter);
    }
}

