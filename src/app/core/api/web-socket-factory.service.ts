import {WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/observable/dom/WebSocketSubject';
import {NextObserver} from 'rxjs/src/Observer';
import {BehaviorSubject} from 'rxjs';
import {Message} from '../../shared/model/messages/interfaces/message.interface';
import {Inject, Injectable} from '@angular/core';
import {ConfigService} from '../basics/config.service';
import {filter} from 'rxjs/operators';
import {Config} from '../../shared/model/config/config.model';
import {webSocket} from 'rxjs/webSocket';

/**
 * This class exposes an observable that generates WebSocketWrapper classes whenever the connection configuration changes. Since only one WebSocketWrapper can be active
 * at a time per WebSocketFactoryService instance. The class keeps track of the WebSocketWrapper's and disconnects previous instances
 */
@Injectable()
export class WebSocketFactoryService extends BehaviorSubject<WebSocketSubject<Message>> {

    /** Reference to the current Config held by WebSocketFactoryService. */
    private _config: Config;

    /** Default constructor. */
    constructor(@Inject(ConfigService) private _configService: ConfigService) {
        super(null);
        this._configService.pipe(
            filter(c => c.endpoint_ws != null),
        ).subscribe(c => this.connect(c))
    }

    /**
     * Establishes a connection to the provided endpoint using the provided config. Connection is only established if
     * endpoint config has changed.
     */
    private connect(c: Config) {

        /* Check if connection has changed. */
        if (this._config && this._config.endpoint_ws == c.endpoint_ws) {
            console.log('no changes to cnonection in config, not reconnecting');
            return false;
        }

        /* Update local config instance. */
        this._config = c;

        /* Reconnect. */
        this.reconnect()
    }

    /**
     * Reconnects the WebSocket using the current settings. If the active WebSocket instance is connected, that connection is dropped.
     */
    public reconnect() {
        /* If there is an active WebSocketSubject then disconnect it. */
        if (this.getValue() != null) {
            console.log('disconnecting to reconnect');
            this.getValue().complete();
        }

        /* Create observers for WebSocket status. */
        let openObserver = <NextObserver<Event>>{
            next: (ev: Event) => {
                console.log(`WebSocket connected to Cineast (${this._config.endpoint_ws}).`);
            }
        };
        let closeObserver = <NextObserver<CloseEvent>>{
            next: (ev: CloseEvent) => {
                console.log(`WebSocket disconnected from Cineast (${this._config.endpoint_ws}, Code: ${ev.code}).`);
            }
        };

        /* Prepare config and create new WebSocket. */
        let config: WebSocketSubjectConfig<Message> = <WebSocketSubjectConfig<Message>>{
            url: this._config.endpoint_ws,
            openObserver: openObserver,
            closeObserver: closeObserver,
            serializer: (m: Message) => JSON.stringify(m, (key, value) => {
                if (key.startsWith('_')) {
                    return undefined;
                } else {
                    return value
                }
            })
        };

        /* Publish next WebSocketSubject. */
        this.next(webSocket(config));
    }
}
