import {WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/observable/dom/WebSocketSubject';
import {NextObserver} from 'rxjs/src/Observer';
import {BehaviorSubject} from 'rxjs';
import {Message} from '../../shared/model/messages/interfaces/message.interface';
import {Inject, Injectable} from '@angular/core';
import {filter} from 'rxjs/operators';
import {Config} from '../../shared/model/config/config.model';
import {webSocket} from 'rxjs/webSocket';
import {AppConfig} from '../../app.config';
import {MatSnackBar} from '@angular/material/snack-bar';

/**
 * This class exposes an observable that generates WebSocketWrapper classes whenever the connection configuration changes. Since only one WebSocketWrapper can be active
 * at a time per WebSocketFactoryService instance. The class keeps track of the WebSocketWrapper's and disconnects previous instances
 */
@Injectable()
export class WebSocketFactoryService extends BehaviorSubject<WebSocketSubject<Message>> {

  /** Reference to the current Config held by WebSocketFactoryService. */
  private _config: Config;

  /** Default constructor. */
  constructor(@Inject(AppConfig) private _configService: AppConfig, private _snackbar: MatSnackBar) {
    super(null);
    this._configService.configAsObservable.pipe(
      filter(c => c.cineastEndpointWs != null),
    ).subscribe(c => this.connect(c))
  }

  /**
   * Reconnects the WebSocket using the current settings. If the active WebSocket instance is connected, that connection is dropped.
   * @param snackbar if the reconnect snackbar shall be shown
   */
  public reconnect(snackbar = true) {
    if (snackbar) {
      this._snackbar.open('Reconnecting to Cineast', 'Dismiss', {duration: 2000})
    }
    /* If there is an active WebSocketSubject then disconnect it. */
    if (this.getValue() != null) {
      console.log('disconnecting to reconnect');
      this.getValue().complete();
    }

    /* Create observers for WebSocket status. */
    const openObserver = <NextObserver<Event>>{
      next: (ev: Event) => {
        console.log(`WebSocket connected to Cineast (${this._config.cineastEndpointWs}).`);
      }
    };
    const closeObserver = <NextObserver<CloseEvent>>{
      next: (ev: CloseEvent) => {
        console.log(`WebSocket disconnected from Cineast (${this._config.cineastEndpointWs}, Code: ${ev.code}).`);
      }
    };

    /* Prepare config and create new WebSocket. */
    const config: WebSocketSubjectConfig<Message> = <WebSocketSubjectConfig<Message>>{
      url: this._config.cineastEndpointWs,
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

  /**
   * Establishes a connection to the provided endpoint using the provided config. Connection is only established if
   * endpoint config has changed.
   */
  private connect(c: Config) {

    /* Check if connection has changed. */
    if (this._config && this._config.cineastEndpointWs === c.cineastEndpointWs) {
      return false;
    }

    /* Update local config instance. */
    this._config = c;

    /* Reconnect. */
    this.reconnect(false)
  }
}
