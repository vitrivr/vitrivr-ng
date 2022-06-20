import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {PingService} from '../core/basics/ping.service';
import {CollabordinatorService} from '../core/competition/collabordinator.service';
import {WebSocketFactoryService} from '../core/api/web-socket-factory.service';

@Component({
  selector: 'app-api-status',
  template: `
      <span>
            <button mat-button [matMenuTriggerFor]="appMenu">
                 <mat-icon>{{_icon}}</mat-icon>&nbsp;{{(_latency < 100000 ? '(' + _latency + 'ms)' : "(&#x221e;)")}}
            </button>
            <mat-menu #appMenu="matMenu">
                <button (click)="reconnectCineast()" mat-menu-item>Reconnect to Cineast</button>
                <mat-divider *ngIf="_collabordinator._online|async"></mat-divider>
                <button mat-menu-item (click)="reconnectCollabordinator()">Reconnect to Collabordinator</button>
            </mat-menu>
        </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PingComponent implements OnInit{

  _icon: string
  _latency: number

  /**
   * Default constructor. Subscribe for PING messages at the CineastWebSocketFactoryService.
   *
   * @param _ping
   * @param _collabordinator CollabordinatorService reference.
   * @param _factory WebSocketFactoryService reference.
   */
  constructor(private _ping: PingService, public _collabordinator: CollabordinatorService, private _factory: WebSocketFactoryService, private ref: ChangeDetectorRef) {
  }

  /**
   * Tries to re-connect to the Cineast service.
   */
  public reconnectCineast() {
    this._factory.reconnect(true);
  }

  /**
   * Tries to re-connect to the Collabordinator service.
   */
  public reconnectCollabordinator() {
    this._collabordinator.connect();
  }

  ngOnInit(): void {
    this._ping.subscribe(s => {
      switch (s.status) {
        case 'DISCONNECTED':
          this._icon = 'flash_off';
          break;
        case 'ERROR':
          this._icon = 'error';
          break;
        case 'OK':
          this._icon = 'check_circle';
          break;
        default:
          this._icon = 'watch_later'
      }
      this.ref.detectChanges()
    })
    this._ping.asObservable().subscribe(s => {
      this._latency = s.latency
      this.ref.detectChanges()
    })
  }
}
