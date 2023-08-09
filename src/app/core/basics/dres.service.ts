import {Injectable} from '@angular/core';
import {AppConfig} from '../../app.config';
import {
  ClientRunInfo,
  ClientRunInfoService,
  ClientTaskInfo,
  LoginRequest,
  UserDetails,
  UserService
} from '../../../../openapi/dres';
import {BehaviorSubject, Observable, publish} from 'rxjs';

@Injectable()
export class DresService {

  private _status: BehaviorSubject<UserDetails> = new BehaviorSubject(null)
  private _activeRun: BehaviorSubject<ClientRunInfo> = new BehaviorSubject(null);
  private _activeTask: BehaviorSubject<ClientTaskInfo> = new BehaviorSubject(null);
  private _sessionId: string = undefined;

  constructor(private _configService: AppConfig, private _runInfo: ClientRunInfoService, private _dresUser: UserService,) {
    this._configService.configAsObservable.subscribe(config => {
          if (config?.dresEndpointRest == null) {
            return
          }
          this._dresUser.getApiV1User().subscribe(
              {
                next: (user) => {
                  this._status.next(user)
                },
                error: (error) => {
                  this._status.error(error)
                }
              })
        }
    )

    // init dres info
    this.updateDresInfo()

    // update every 5 seconds
    setInterval(
        () => {
          this.updateDresInfo()
        },
        5 * 1000
    )

  }

  private updateDresInfo() {
    if (this.getStatus() == null) {
      return
    }
    this._runInfo.getApiV1ClientRunInfoList(this.getStatus()?.sessionId).subscribe(list => {
      const l = list.runs.filter(info => info.status == 'ACTIVE');
      const activeRun = l.length == 0 ? null : l[0]
      this._activeRun.next(activeRun)
      if (activeRun) {
        this._runInfo.getApiV1ClientRunInfoCurrenttaskWithRunid(this._activeRun.getValue().id, this.getStatus().sessionId).subscribe(task => {
          this._activeTask.next(task)
        })
      }
    })
  }

  public loginByUsernamePassword(username: string, password: string): string{
    let lr = this._dresUser.postApiV1Login({
      username: username,
      password: password
    } as LoginRequest)
    lr.subscribe({
      next: (user) => {
        if (user) {
          this._sessionId = user.sessionId;
        }
      },
      error: (e) => {
        console.error('failed to connect to DRES', e)
      }
    })
    return null
  }

  public statusObservable(): Observable<UserDetails> {
    return this._status.asObservable()
  }

  public activeTaskObservable(): Observable<ClientTaskInfo> {
    return this._activeTask.asObservable()
  }

  public activeRunObservable(): Observable<ClientRunInfo> {
    return this._activeRun.asObservable()
  }

  public activeTask(): ClientTaskInfo {
    return this._activeTask.getValue()
  }

  public activeRun(): ClientRunInfo {
    return this._activeRun.getValue()
  }

  /**
   * Returns null if an error was thrown during connection
   */
  public getStatus(): UserDetails {
    try {
      if (this._status.getValue()) {
        return this._status.getValue()
      }
      return null
    } catch (e) {
      return null
    }
  }

}