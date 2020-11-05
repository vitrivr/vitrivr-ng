import {Injectable} from '@angular/core';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {MetadataService} from '../openapi/api/metadata.service';
import {VideoUtil} from '../../shared/util/video.util';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {ConfigService} from '../basics/config.service';
import {BehaviorSubject, combineLatest, Observable, of, Subject, Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Config} from '../../shared/model/config/config.model';
import {EventBusService} from '../basics/event-bus.service';
import {VbsInteractionLog} from './vbs-interaction-log.model';
import {bufferTime, catchError, debounceTime, filter, flatMap, map, tap} from 'rxjs/operators';
import {SelectionService} from '../selection/selection.service';
import {QueryService} from '../queries/query.service';
import {VbsInteraction} from '../../shared/model/vbs/interfaces/vbs-interaction.model';
import {VbsResultsLog} from './vbs-results-log.model';
import {DatabaseService} from '../basics/database.service';
import Dexie from 'dexie';
import {LscUtil} from '../../shared/model/lsc/lsc.util';
import {LscSubmission} from '../../shared/model/lsc/interfaces/lsc-submission.model';

/**
 * This service is used to submit segments to VBS web-service for the Video Browser Showdown challenge. Furthermore, if
 * the VBS mode is active, it listens to events emmited on the EventBus and maps them to VbsActions
 */
@Injectable()
export class VbsSubmissionService {
  /** The observable used to react to changes to the Vitrivr NG configuration. */
  private _config: Observable<[string, string, number, boolean, number]>;

  /** The subject used to submit segments to the VBS service. */
  private _submitSubject = new Subject<[SegmentScoreContainer, number]>();

  /** Reference to the subscription that is used to issue submits to the VBS server. */
  private _submitSubscription: Subscription;

  /** Reference to the subscription that is used to submit updates to the results list. */
  private _resultsSubscription: Subscription;

  /** Reference to the subscription that is used to submit interaction logs on a regular basis to the VBS server. */
  private _interactionlogSubscription: Subscription;

  /** Reference to the subscription to the vitrivr NG configuration. */
  private _configSubscription: Subscription;

  /** Table for persisting result logs. */
  private _resultsLogTable: Dexie.Table<any, number>;

  /** Table for persisting submission logs */
  private _submissionLogTable: Dexie.Table<any, number>;

  /** Table for persisting interaction logs. */
  private _interactionLogTable: Dexie.Table<VbsInteractionLog, number>;


  private _vbs = false;
  private _dres = false;
  private _sessionId = undefined;
  private _lsc = false;


  /**
   * Constructor for VbsSubmissionService.
   *
   * @param {ConfigService} _config
   * @param {EventBusService} _eventbus Reference to the singleton EventBusService instance.
   * @param {QueryService} _queryService Reference to the singleton QueryService instance.
   * @param {SelectionService} _selection Reference to the singleton SelectionService instance.
   * @param {MetadataService} _metadata
   * @param {HttpClient} _http
   * @param {MatSnackBar} _snackBar
   */
  constructor(_config: ConfigService,
              private _eventbus: EventBusService,
              private _queryService: QueryService,
              private _selection: SelectionService,
              private _metadata: MetadataService,
              private _http: HttpClient,
              private _snackBar: MatSnackBar,
              _db: DatabaseService) {

    _config.subscribe(config => {
      this._lsc = config.get<boolean>('competition.lsc');
      this._vbs = config.get<boolean>('competition.vbs');
      this._dres = config.get<boolean>('competition.dres');
      this._sessionId = config.get<string>('competition.sessionid') // technically, with withCredentials not needed anymore
    });

    /* Configuration */
    this._config = _config.asObservable().pipe(
      filter(c => c.get<string>('competition.endpoint') != null),
      map(c => <[string, string, number, boolean, number]>[c.get<string>('competition.endpoint').endsWith('/') ? c.get<string>('competition.endpoint').slice(0, -1) : c.get<string>('competition.endpoint'), c.get<string>('competition.teamid'), c.get<number>('competition.toolid'), c.get<boolean>('competition.log'), c.get<number>('competition.loginterval')])
    );

    /* This subscription registers the event-mapping, recording and submission stream if the VBS mode is active and un-registers it, if it is switched off! */
    this._configSubscription = this._config.subscribe(([endpoint, team, tool, log, loginterval]) => {
      if (endpoint && team) {
        this._resultsLogTable = _db.db.table('log_results');
        this._interactionLogTable = _db.db.table('log_interaction');
        this._submissionLogTable = _db.db.table('log_submission');
        this.reset(endpoint, team, tool, log, loginterval)
      } else {
        this.cleanup()
      }
    });
  }

  /**
   * Returns true uf VBS mode is active and properly configured (i.e. endpoint and team ID is specified).
   *
   * @return {boolean}
   */
  get isOn(): Observable<boolean> {
    return this._config.pipe(map(([endpoint, team]) => endpoint != null && team != null));
  }

  /**
   * Convenience method to transform the timestamp within a video into a frame index.
   *
   * @param {number} timestamp Timestamp within the video.
   * @param {number} fps The FPS of the video.
   */
  // tslint:disable-next-line:member-ordering
  private static timeToFrame(timestamp: number, fps: number) {
    return Math.floor(timestamp * fps);
  }

  /**
   * Submits the provided SegmentScoreContainer and to the VBS endpoint. Uses the segment's start timestamp as timepoint.
   *
   * @param {SegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
   */
  public submitSegment(segment: SegmentScoreContainer) {
    if (this.isOn) {
      this.submit(segment, (segment.startabs + segment.endabs) / 2);
    }
  }

  /**
   * Submits the provided SegmentScoreContainer and the given time to the VBS endpoint.
   *
   * @param {SegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
   * @param time The video timestamp to submit.
   */
  public submit(segment: SegmentScoreContainer, time: number) {
    console.debug(`Submitting segment ${segment.segmentId} @ ${time}`);
    this._submitSubject.next([segment, time]);
    this._selection.add(this._selection.availableTags[0], segment.segmentId);
  }

  /**
   * Resets the VBSSubmissionService, re-initiating all subscriptions.
   */
  public reset(endpoint: string, team: string, tool: number = 1, log: boolean = false, loginterval: number = 5000) {
    /* Run cleanup. */
    this.cleanup();

    /* Setup interaction log subscription, which runs in a regular interval. */
    if (log === true) {
      this._interactionlogSubscription = VbsInteractionLog.mapEventStream(this._eventbus.observable()).pipe(
        bufferTime(loginterval),
        map((events: VbsInteraction[], index: number) => {
          if (events && events.length > 0) {
            const iseq = new VbsInteractionLog(team, tool);
            iseq.events.push(...events);
            return iseq
          } else {
            return null
          }
        }),
        filter(submission => submission != null),
        flatMap((submission: VbsInteractionLog) => {
          /* Prepare log submission. */
          const headers = new HttpHeaders().append('Content-Type', 'application/json');
          let params = new HttpParams().set('team', submission.teamId).set('member', String(submission.memberId));
          let url = String(`${endpoint}/log`);
          if (this._dres) { // DRES has different endpoints
            url += '/query';
            params = new HttpParams();
          }
          const observable = this._http.post(url, JSON.stringify(submission), {
            responseType: 'text',
            params: params,
            headers: headers,
            withCredentials: this._dres // Only use withCredentials with DRES
          });

          /* Do some logging and catch HTTP errors. */
          return observable.pipe(
            tap(o => {
              console.log(`Submitting interaction log to VBS server.`);
              this._interactionLogTable.add(submission);
            }),
            catchError((err) => {
              this._interactionLogTable.add(submission);
              return of(`Failed to submit segment to VBS due to a HTTP error (${err.status}).`)
            })
          );
        })
      ).subscribe();

      /* Setup results subscription, which is triggered upon change to the result set. */

      const resultSubscription = this._queryService.observable.pipe(
        filter(f => f === 'ENDED'),
        flatMap(f => this._queryService.results.segmentsAsObservable),
        debounceTime(1000)
      ); /* IMPORTANT: Limits the number of submissions to one per second. */

      const queryInfo = new BehaviorSubject(null);
      const querySubscription = this._eventbus.observable().pipe(
        filter(event => event != null),
        filter(event => event.components.filter(component => component.context.has('q:categories')).length > 0),
        tap(event => queryInfo.next(event))
      ).subscribe();

      this._resultsSubscription = combineLatest([resultSubscription, this._eventbus.currentView()]).pipe(
        map(([results, context]) => {
          if (this._vbs) {
            return VbsResultsLog.mapSegmentScoreContainer(team, tool, context, results, queryInfo.getValue())
          }
          if (this._lsc) {
            return LscUtil.mapSegmentScoreContainer(team, tool, context, results, queryInfo.getValue())
          }
          console.log(`no competition chosen, not logging`);
          return null;
        }),
        filter(submission => submission != null),
        flatMap((submission: VbsResultsLog | LscSubmission) => {
          /* Prepare log submission. */
          const headers = new HttpHeaders().append('Content-Type', 'application/json');
          let params = new HttpParams().set('member', String(submission.memberId));
          let url = String(`${endpoint}/log`);
          if (this._vbs) {
            params.set('team', (submission as VbsResultsLog).teamId)
          }
          if (this._dres) { // DRES has different endpoints
            url += '/result';
            params = new HttpParams();
          }
          this._resultsLogTable.add(submission);

          const observable = this._http.post(url, JSON.stringify(submission), {
            responseType: 'json',
            params: params,
            headers: headers,
            withCredentials: this._dres // Only use withCredentials with DRES
          });

          /* Do some logging and catch HTTP errors. */
          return observable.pipe(
            tap(o => {
              console.log(`Submitting result log to VBS server.`);
            }),
            catchError((err) => {
              return of(`Failed to submit segment to VBS due to a HTTP error (${err.status}).`)
            })
          );
        })
      ).subscribe();
    }

    /* Setup submission subscription, which is triggered manually. */
    this._submitSubscription = this._submitSubject.pipe(
      map(([segment, time]): [SegmentScoreContainer, number] => {
        if (this._vbs || this._dres) {
          let fps = Number.parseFloat(segment.objectScoreContainer.metadataForKey('technical.fps'));
          if (Number.isNaN(fps) || !Number.isFinite(fps)) {
            fps = VideoUtil.bestEffortFPS(segment);
          }
          return [segment, VbsSubmissionService.timeToFrame(time, fps)]
        }
        if (this._lsc) {
          return [segment, time];
        }
        return [segment, time];
      }),
      flatMap(([segment, frame]) => {
        /* Prepare VBS submission. */
        let id: string;
        let params: HttpParams
        if (this._lsc) {
          id = segment.segmentId.replace('is_', '');
          params = new HttpParams().set('team', String(team)).set('member', String(tool)).set('image', id);
        }
        if (this._vbs) {
          id = parseInt(segment.objectId.replace('v_', ''), 10).toString();
          params = new HttpParams().set('team', String(team)).set('member', String(tool)).set('video', id).set('frame', String(frame));
        }
        if (this._dres) {
          // DRES requires an 'item' field: zero-padded, 5 digit video id, the session id of the participant and the frame number
          id = this._lsc ? segment.segmentId.replace('is_', '') : segment.objectId.replace('v_', '');
          // params = new HttpParams().set('session', this._sessionId).set('item', String(id)).set('frame', String(frame));
          params = new HttpParams().set('item', String(id)).set('frame', String(frame));
        }

        params = params.set('client_timestamp', String(Date.now()))
        this._submissionLogTable.add(params)

        const observable = this._http.get(String(`${endpoint}/submit`), {responseType: 'text', params: params, withCredentials: this._dres});

        /* Do some logging and catch HTTP errors. */
        return observable.pipe(
          tap(o => console.log(`Submitting element to server; id: ${id}`), err => console.log(`Failed to submit segment to VBS due to a HTTP error (${err.status}).`)),
          catchError(err => of(err.error))
        );
      }),
      map((msg: string) => {
          console.log(msg);
          if (this._dres) {
            try {
              const res = JSON.parse(msg);
              msg = res.description;
              if (msg.indexOf('incorrect') > -1) {
                return [msg, 'snackbar-error']
              }
              if (res.status == false) {
                return [msg, 'snackbar-warning']
              }
              if (res.status == true) {
                return [msg, 'snackbar-success']
              }
            } catch (e) {
              /* We have to catch invalid json responses. */
              return [msg, 'snackbar-error'];
            }
          }
          if (msg.indexOf('Correct') > -1) {
            return [msg, 'snackbar-success'];
          } else if (msg.indexOf('Wrong') > -1) {
            return [msg, 'snackbar-error'];
          } else {
            return [msg, 'snackbar-warning'];
          }
        }
      )
    ).subscribe(([msg, clazz]) => {
      this._snackBar.open(msg, null, {duration: Config.SNACKBAR_DURATION, panelClass: clazz});
    });
  }

  /**
   * Ends all the running subscriptions and cleans up the references.
   */
  private cleanup() {
    if (this._submitSubscription != null) {
      this._submitSubscription.unsubscribe();
      this._submitSubscription = null;
    }
    if (this._interactionlogSubscription != null) {
      this._interactionlogSubscription.unsubscribe();
      this._interactionlogSubscription = null;
    }
    if (this._resultsSubscription != null) {
      this._resultsSubscription.unsubscribe();
      this._interactionlogSubscription = null
    }
  }
}
