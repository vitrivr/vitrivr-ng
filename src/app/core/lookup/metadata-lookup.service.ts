import {Inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {CineastRestAPI} from "../api/cineast-rest-api.service";
import {ConfigService} from "../basics/config.service";
import {Observable} from "rxjs";
import {MetadataQueryResult} from "../../shared/model/messages/interfaces/responses/metadata-query-result.interface";
import {first} from "rxjs/operators";
/**
 * This service provides access to the Metadata stored and exposed by Cineast through the Cineast RESTful API. Metadata is general,
 * often technical information regarding a specific media object.
 */
@Injectable()
export class MetadataLookupService extends CineastRestAPI {
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
     * This method returns a list of Metadata for the given objectId predicate.
     *
     * @param {string} objectId ID of the MediaObject for which to lookup MediaObjectMetadata.
     */
    public lookup(objectId: string): Observable<MetadataQueryResult> {
        return this.get<MetadataQueryResult>("find/metadata/by/id/" + objectId).pipe(first());
    }
}

