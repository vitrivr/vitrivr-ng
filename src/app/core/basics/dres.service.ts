import {Injectable} from '@angular/core';
import {AppConfig} from '../../app.config';
import {BehaviorSubject, Observable, of, publish} from 'rxjs';
import {map} from 'rxjs/operators';
import {ApiClientEvaluationInfo, ApiClientTaskTemplateInfo, ApiUser, EvaluationClientService, LoginRequest, UserService} from '../../../../openapi/dres';

@Injectable()
export class DresService {

  private _status: BehaviorSubject<ApiUser> = new BehaviorSubject(null)
  private _activeRun: BehaviorSubject<ApiClientEvaluationInfo> = new BehaviorSubject(null);
  private _activeTask: BehaviorSubject<ApiClientTaskTemplateInfo> = new BehaviorSubject(null);
  private _sessionId: string = undefined;

  constructor(private _configService: AppConfig,
              private _runInfo: EvaluationClientService,
              private _dresUser: UserService,) {
    this._configService.configAsObservable.subscribe(config => {
          if (config?.dresEndpointRest == null) {
            return
          }
          this.updateDresUserInfo()
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

  private updateDresUserInfo(){
    this._dresUser.getApiV2User().subscribe(
      {
        next: (user) => {
          this._status.next(user)
          console.log("User loaded: ", user);
        },
        error: (error) => {
          this._status.error(error)
          console.log("Error in user loading", error)
        }
      })
  }

  private updateDresInfo() {
    if (this.getStatus() == null) {
      return
    }
    this._runInfo.getApiV2ClientEvaluationList(this.getStatus()?.sessionId).subscribe(list => {
      const l = list.filter(info => info.status == 'ACTIVE');
      const activeEvaluation = l.length == 0 ? null : l[0]
      this._activeRun.next(activeEvaluation)
      if (activeEvaluation) {
        this._runInfo.getApiV2ClientEvaluationCurrentTaskByEvaluationId(this._activeRun.getValue().id, this.getStatus().sessionId).subscribe(task => {
          this._activeTask.next(task)
        })
      }
    })
  }

  public loginByUsernamePassword(username: string, password: string): Observable<ApiUser>{
    return this._dresUser.postApiV2Login({
      username: username,
      password: password
    } as LoginRequest).pipe(
      map(user => {
        if(user){
          this._sessionId = user.sessionId;
          this._status.next(user)
          return user;
        }else{
          this._status = null
          return null
        }
      })
    );
  }

  public statusObservable(): Observable<ApiUser> {
    return this._status.asObservable()
  }

  public activeTaskObservable(): Observable<ApiClientTaskTemplateInfo> {
    return this._activeTask.asObservable()
  }

  public activeRunObservable(): Observable<ApiClientEvaluationInfo> {
    return this._activeRun.asObservable()
  }

  public activeTask(): ApiClientTaskTemplateInfo {
    return this._activeTask.getValue()
  }

  public activeRun(): ApiClientEvaluationInfo {
    return this._activeRun.getValue()
  }

  /**
   * Returns null if an error was thrown during connection
   */
  public getStatus(): ApiUser {
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
