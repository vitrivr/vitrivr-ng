
import {Injectable} from "@angular/core";
import {CineastAPI} from "../api/cineast-api.service";
import {MetadataLookup} from "../../shared/model/messages/metadata-lookup.model";
import {MetadataQueryResult} from "../../shared/model/messages/interfaces/metadata-query-result.interface";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";


/**
 * This service allows for simple lookup for media object metadata. It follows a simple Observer pattern that
 * allows endpoints to register for notifications about state changes (i.e. new MetadataQueryResult objects that
 * become available).
 */
@Injectable()
export class MetadataLookupService extends Subject<MetadataQueryResult> {
    /**
     * Default constructor; Registers for QR_METADATA messages
     *
     * @param _api Reference to the CineastAPI. Gets injected by DI.
     */
    constructor(private _api: CineastAPI) {
        super();
        _api.observable().filter(msg => ("QR_METADATA" === msg[0])).subscribe((msg) => this.onApiMessage(msg[1]));
    }

    /**
     * Instructs the service to lookup metadata for a specific media object.
     *
     * @param objectid ID of the media object for which to lookup metadata.
     */
    public lookup(objectid: string): void {
        this._api.send(new MetadataLookup(objectid));
    }

    /**
     * Callback that gets invoked whenever a message is pushed from the underlying WebSocket.
     *
     * @param message
     */
    private onApiMessage(message: string): void {
        this.next(<MetadataQueryResult>JSON.parse(message));
    }
}