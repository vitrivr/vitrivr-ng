import {Inject, Injectable} from '@angular/core';
import {WebSocketFactoryService} from '../api/web-socket-factory.service';
import {filter} from 'rxjs/operators';
import {Message} from '../../shared/model/messages/interfaces/message.interface';
import {SkelLookupResult} from '../../shared/model/messages/interfaces/responses/skel-lookup-result.interface';
import {WebSocketSubject} from 'rxjs/webSocket';
import {Observable, Subject} from 'rxjs';
import {PoseKeypoints} from '../../shared/model/pose/pose-keypoints.model';
import {SkelLookup} from '../../shared/model/messages/queries/skel-lookup.model'

export interface NoPose {
  kind: 'nopose';
}

export interface Pose {
  kind: 'pose';
  payload: PoseKeypoints
}

export type PoseResult = NoPose | Pose;

@Injectable()
export class PoseService {
  private _subject: Subject<PoseResult> = new Subject();
  private _socket: WebSocketSubject<Message>;
  private _running = 0;

  constructor(@Inject(WebSocketFactoryService) _factory: WebSocketFactoryService) {
    _factory.asObservable().pipe(filter(ws => ws != null)).subscribe(
      ws => {
        this._socket = ws;
        this._socket.pipe(
          filter(msg => msg.messageType === 'QR_SKEL')
        ).subscribe((msg: Message) => this.onApiMessage(msg));
      },
      _err => {
        this._socket = null;
        this._running = 0;
      }
    );
  }

  private onApiMessage(message: Message): void {
    this._running = 0;
    const obj = <SkelLookupResult>message;
    if (obj.content.length > 0) {
      this._subject.next({kind: 'pose', payload: obj.content[0]});
    } else {
      this._subject.next({kind: 'nopose'});
    }
  }

  /**
   * Returns an Observable that allows an Observer to be notified about
   * results from the pose service.
   *
   * @returns {Observable<PoseResult>}
   */
  get observable(): Observable<PoseResult> {
    return this._subject.asObservable();
  }

  /**
   * Starts a skeleton lookup
   *
   * @param img The base 64 encoded photo from which a pose should be estimated
   * @returns {boolean} true if query was issued, false otherwise.
   */
  public skelLookup(img: string): boolean {
    if (this._running > 0) {
      console.warn('There is already a query running, not executing pose query');
      return false;
    }
    if (!this._socket) {
      console.warn('No socket available, not executing pose query');
      return false;
    }
    const query = new SkelLookup(img);
    this._socket.next(query);
    this._running += 1;
    return true;
  }
}
