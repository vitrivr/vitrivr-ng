import {WebSocketFactoryService} from "./web-socket-factory.service";
import {ConfigService} from "../basics/config.service";
import {Inject} from "@angular/core";

/**
 * This class generates WebSocketWrapper classes that provide access to a WebSocket connection. It extends the WebSocketFactoryService and binds its settings to
 * the Vitrivr NG configuration facility.
 */
export class CineastWebSocketFactoryService extends WebSocketFactoryService {
    /** Default constructor. */
    constructor(@Inject(ConfigService) _configService : ConfigService) {
        super(null);
        _configService.filter(c => c.endpoint_ws != null).subscribe((config) => {
            this.connect(config.endpoint_ws, 5000);
        });
    }
}
