import {Inject, Injectable} from '@angular/core';
import {filter} from 'rxjs/operators';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {CollabordinatorMessage} from '../../shared/model/messages/collaboration/collabordinator-message.model';
import {BehaviorSubject, Subject} from 'rxjs';
import {Tag} from '../selection/tag.model';
import {Config} from '../../shared/model/config/config.model';
import {AppConfig} from '../../app.config';

/**
 * The {@link CollabordinatorService} is a {@link BehaviorSubject} that interacts with the Collabordinator web service via
 * WebSocket an publishes changes to subscribers of the {@link CollabordinatorService}.
 */
@Injectable()
export class CollabordinatorService extends Subject<CollabordinatorMessage> {

  /** The Vitrivr NG configuration as observable */
  private _webSocket: WebSocketSubject<CollabordinatorMessage>;

  public readonly _online: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  /** The current instance of the loaded Config. */
  private _config: Config;
  private off: boolean = true;

  /**
   * Constructor for the CollabordinatorService.
   *
   * @param _config ConfigService instance that serves the recent config.
   */
  constructor(@Inject(AppConfig) _config: AppConfig) {
    super();
    _config.configAsObservable.pipe(
      filter(c => c._config.competition.collabordinator != null)
    ).subscribe(c => {
      this._config = c;
      this.connect();
    });
  }

  /**
   * Sends a signal to the Collabordinator endpoint that tells it to add items to its list.
   *
   * @param tag The Tag for which to add a Collabordinator entry.
   * @param id List of ids to add.
   */
  public add(tag: Tag, ...id: string[]) {
    if(this.off){
      return
    }
    if (this._webSocket) {
      this._webSocket.next({action: 'ADD', key: `vitrivr~${tag.name.toLowerCase()}`, attribute: id})
    } else {
      console.log('Collabordinator service is currently not available.')
    }
  }

  /**
   * Sends a signal to the Collabordinator endpoint that tells it to remove items from its list.
   *
   * @param tag The Tag for which to remove a Collabordinator entry.
   * @param id List of ids to remove.
   */
  public remove(tag: Tag, ...id: string[]) {
    if(this.off){
      return
    }
    if (this._webSocket) {
      this._webSocket.next({action: 'REMOVE', key: `vitrivr~${tag.name.toLowerCase()}`, attribute: id})
    } else {
      console.log('Collabordinator service is currently not available.')
    }
  }

  /**
   * Sends a signal to the Collabordinator endpoint that tells it to clear the list.
   */
  public clear(tag: Tag) {
    if(this.off){
      return
    }
    if (this._webSocket) {
      this._webSocket.next({action: 'CLEAR', key: `vitrivr~${tag.name.toLowerCase()}`, attribute: []})
    } else {
      console.log('Collabordinator service is currently not available.')
    }
  }

  /**
   * Connects to the Collabordinator service. If an existing connection is open, that connection will be closed.
   */
  public connect(): boolean {
    if (!this._config) {
      return false;
    }
    if (this._webSocket) {
      this._webSocket.complete();
    }
    if(this._config._config.competition.collabordinator===null){
      console.debug("collabordinator not enabled in config")
      this.off = true
      return
    }
    this.off = false
    this._webSocket = webSocket<CollabordinatorMessage>(this._config._config.competition.collabordinator);
    this._online.next(true)
    this._webSocket.subscribe(
      {
        next: (v) => {
          this.next(v)
        },
        error: (error) => {
          console.error('Error occurred while communicating with Collabordinator web service');
          console.error(error)
          this._online.next(false)
        },
        complete: () => {
          console.log('Connection to Collabordinator web service was closed.');
          this._online.next(false)
        }
      }
    )
    return true;
  }
}
