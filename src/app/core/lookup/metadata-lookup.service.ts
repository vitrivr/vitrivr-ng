import {Inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {CineastRestAPI} from "../api/cineast-rest-api.service";
import {ConfigService} from "../basics/config.service";
import {Observable} from "rxjs/Observable";
import {MediaMetadata} from "../../shared/model/media/media-metadata.model";
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
     * @param {string} objectId ID of the MediaObject for which to lookup MediaMetadata.
     */
    public lookup(objectId: string): Observable<MediaMetadata[]> {
        return this.get<MediaMetadata[]>("find/metadata/by/id/" + objectId).first();
    }
}

