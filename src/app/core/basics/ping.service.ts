import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, timer} from 'rxjs';
import {WebSocketFactoryService} from '../api/web-socket-factory.service';
import {filter, flatMap, skip} from 'rxjs/operators';
import {Message} from '../../shared/model/messages/interfaces/message.interface';
import {ApiStatus} from '../../shared/model/internal/api-status.model';
import {Ping} from '../../shared/model/messages/interfaces/responses/ping.interface';
import {WebSocketSubject} from 'rxjs/webSocket';
import {AppConfig} from '../../app.config';
import {MatSnackBar} from '@angular/material/snack-bar';
import {QueryService} from '../queries/query.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NoConnectDialogComponent} from './no-connect-dialog';

/**
 * This is one of the only classes which does not fully use the openapi-services. This is due to the fact that it exposes / measures different things than the status endpoint in cineast
 */
@Injectable()
export class PingService extends BehaviorSubject<ApiStatus> {
  /** Timestamp when last PING packet was sent to Cineast. */
  private _last = 0;

  /** Number of packets in transit. Reset after every response. */
  private _transit = 0;

  /** The WebSocketWrapper currently used by QueryService to process and issue queries. */
  private _socket: WebSocketSubject<Message>;

  /** Current connection status */
  private _currentStatus = '';
  private _dialogRef: MatDialogRef<NoConnectDialogComponent>;

  constructor(@Inject(WebSocketFactoryService) private _factory: WebSocketFactoryService,
              @Inject(AppConfig) _config: AppConfig,
              private _snackBar: MatSnackBar,
              private _queryService: QueryService,
              private _dialog: MatDialog) {
    super(new ApiStatus(Date.now(), 'DISCONNECTED', Number.MAX_VALUE));
    _factory.asObservable()
      .pipe(filter(ws => ws != null))
      .subscribe(ws => {
        this._socket = ws;
        this._socket.pipe(
          filter(msg => ['PING'].indexOf(msg.messageType) > -1)
        ).subscribe((msg: Message) => this.onPingResponse(<Ping>msg));
      });

    /** Ignore first element since it will be the default */
    this.pipe(skip(1)).subscribe(status => {
      if (status.status !== this._currentStatus && status.status === 'DISCONNECTED') {

        this._dialogRef = this._dialog.open(NoConnectDialogComponent);

        this._dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this._dialogRef = undefined
            this._factory.reconnect(true)
          }
        });
      }
      if (status.status === 'OK') {
        if (this._dialogRef) {
          this._dialogRef.close(false)
        }
      }
      this._currentStatus = status.status
    });

    /* Subscribes to changes in the configuration file and dispatches the ping timer. */
    _config.configAsObservable.pipe(flatMap(c => timer(0, c.get<number>('api.ping_interval')))).subscribe(() => this.onTimer())
  }

  /**
   * Processes a Timer event; sens a new PING messages and logs the time. If the number of PING messages in transit
   * exceeds 1 then the ApiStatus is changed to DISCONNECTED.
   */
  private onTimer() {
    if (this._socket) {
      this._last = Date.now();
      this._transit += 1;
      this._socket.next(<Message>{messageType: 'PING'});
      if (this._transit > 1) {
        this.next(new ApiStatus(Date.now(), 'DISCONNECTED', Number.MAX_VALUE));
        this._transit = 0;
        /** If a query is particularly long-running, it might look like a disconnect. In that case, we do not want to reset the WS-connection
         * Additionally, if the user is currently deciding on what to do about reconnecting, do not attempt reconnecting. */
        if (!this._queryService.running && !this._dialogRef) {
          this._factory.reconnect(false)
        }
      }
    }
  }

  /**
   * Processes a PING response. Calculates the latency in ms and publishes the new ApiStatus.
   *
   * @param msg The Ping message received.
   */
  private onPingResponse(msg: Ping) {
    const now = Date.now();
    this._transit -= 1;
    this.next(new ApiStatus(now, msg.status, now - this._last));
  }
}
