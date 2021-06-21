import {Injectable} from '@angular/core';
import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {VideoUtil} from '../../shared/util/video.util';
import {HttpClient} from '@angular/common/http';
import {combineLatest, EMPTY, Observable, of, Subject, Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Config} from '../../shared/model/config/config.model';
import {EventBusService} from '../basics/event-bus.service';
import {DresTypeConverter} from './dres-type-converter.util';
import {bufferTime, catchError, debounceTime, filter, map, mergeMap, tap} from 'rxjs/operators';
import {SelectionService} from '../selection/selection.service';
import {QueryService} from '../queries/query.service';
import {DatabaseService} from '../basics/database.service';
import Dexie from 'dexie';
import {UserDetails} from './dres/model/userdetails.model';
import {AppConfig} from '../../app.config';
import {MetadataService} from '../../../../openapi/cineast';
import {LogService, QueryEventLog, QueryResultLog, SessionId, StatusService, SubmissionService, SuccessfulSubmissionsStatus, SuccessStatus, UserService} from '../../../../openapi/dres';
 import {TemporalListComponent} from '../../results/temporal/temporal-list.component';

/**
 * This service is used to submit segments to VBS web-service for the Video Browser Showdown challenge. Furthermore, if
 * the VBS mode is active, it listens to events emitted on the EventBus and maps them to VbsActions
 */
@Injectable()
export class VbsSubmissionService {
  /** The subject used to submit segments to the VBS service. */
  private _submitSubject = new Subject<[MediaSegmentScoreContainer, number]>();

  /** Reference to the subscription that is used to issue submits to the VBS server. */
  private _submitSubscription: Subscription;

  /** Reference to the subscription that is used to submit updates to the results list. */
  private _resultsSubscription: Subscription;

  /** Reference to the subscription for temporal scoring objects that is used to submit updates to the results list. */
  private _temporalResultsSubscription: Subscription;


  /** Reference to the subscription that is used to submit interaction logs on a regular basis to the VBS server. */
  private _interactionlogSubscription: Subscription;

  /** Reference to the subscription to the vitrivr NG configuration. */
  private _configSubscription: Subscription;

  /** Table for persisting result logs. */
  private _resultsLogTable: Dexie.Table<any, number>;

  /** Table for persisting submission logs */
  private _submissionLogTable: Dexie.Table<any, number>;

  /** Table for persisting interaction logs. */
  private _interactionLogTable: Dexie.Table<DresTypeConverter, number>;

  /** Internal flag used to determine if VBS competition is running. */
  private _vbs = false;

  /** Internal flag used to determine if LSC competition is running. */
  private _lsc = false;

  /** SessionID retrieved from DRES endpoint, automatically connected via second tab. Does not support private mode */
  private _sessionId = undefined;

  /** Observable used to query the DRES status.*/
  private readonly _status: Observable<SessionId>

  /** Observable used to query the DRES user */
  private readonly _user: Observable<UserDetails>

  constructor(private _config: AppConfig,
              private _eventbus: EventBusService,
              private _queryService: QueryService,
              private _selection: SelectionService,
              private _metadata: MetadataService,
              private _http: HttpClient,
              private _snackBar: MatSnackBar,
              private _dresSubmit: SubmissionService,
              private _dresLog: LogService,
              private _dresUser: UserService,
              _db: DatabaseService) {

    /* This subscription registers the event-mapping, recording and submission stream if the VBS mode is active and un-registers it, if it is switched off! */
    this._configSubscription = _config.configAsObservable.subscribe(config => {
      if (config?.dresEndpointRest) {
        this._resultsLogTable = _db.db.table('log_results');
        this._interactionLogTable = _db.db.table('log_interaction');
        this._submissionLogTable = _db.db.table('log_submission');
        this.reset(config)
      } else {
        this.cleanup()
      }
    });
    this._status = this._dresUser.getApiUserSession()
    this._status.subscribe(status => {
        this._sessionId = status.sessionId;
      },
      error => {
        console.error('failed to connect to DRES', error)
      })
  }

  /**
   * Returns true uf VBS mode is active and properly configured (i.e. endpoint and team ID is specified).
   *
   * @return {boolean}
   */
  get isOn(): Observable<boolean> {
    return this._config.configAsObservable.pipe(map(c => c.get<boolean>('competition.host')));
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
   * Submits the provided SegmentScoreContainer to the VBS endpoint. Uses the segment's start timestamp as timepoint.
   *
   * @param {MediaSegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
   */
  public submitSegment(segment: MediaSegmentScoreContainer) {
    if (this.isOn) {
      this.submit(segment, (segment.startabs + segment.endabs) / 2);
    }
  }

  /**
   * Submits the provided SegmentScoreContainer and the given time to the VBS endpoint.
   *
   * @param {MediaSegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
   * @param time The video timestamp to submit.
   */
  public submit(segment: MediaSegmentScoreContainer, time: number) {
    this._submissionLogTable.add([segment.segmentId, time])
    console.debug(`Submitting segment ${segment.segmentId} @ ${time}`);
    this._submitSubject.next([segment, time]);
    this._selection.add(this._selection.availableTags[0], segment.segmentId);
  }

  /**
   * Resets the VBSSubmissionService, re-initiating all subscriptions.
   */
  public reset(config: Config) {
    /* Update local flags. */
    this._lsc = config.get<boolean>('competition.lsc');
    this._vbs = config.get<boolean>('competition.vbs');

    /* Run cleanup. */
    this.cleanup();

    /* Setup interaction log subscription, which runs in a regular interval. */
    if (config.get('competition.log') === true) {
      this._interactionlogSubscription = DresTypeConverter.mapEventStream(this._eventbus.observable()).pipe(
        bufferTime(config.get('competition.loginterval')),
        map((events: QueryEventLog[], index: number) => {
          if (events && events.length > 0) {
            const composite = <QueryEventLog>{timestamp: Date.now(), events: []}
            for (const e of events) {
              composite.events.push(...e.events)
            }
            return composite
          } else {
            return null
          }
        }),
        filter(submission => submission != null),
        mergeMap((submission: QueryEventLog) => {
          this._interactionLogTable.add(submission);

          /* Stop if no sessionId is set */
          if (!this._sessionId) {
            return EMPTY
          }

          /* Submit Log entry to DRES. */
          console.log(`Submitting interaction log to DRES.`);
          return this._dresLog.postLogQuery(this._sessionId, submission).pipe(
            tap(o => {
              console.log(`Successfully submitted interaction log to DRES.`);
            }),
            catchError((err) => {
              return of(`Failed to submit segment to DRES due to a HTTP error (${err}).`)
            })
          );
        })
      ).subscribe();

      /* Setup results subscription, which is triggered upon change to the result set. */
      const resultSubscription = this._queryService.observable.pipe(
        filter(f => f === 'ENDED'),
        mergeMap(f => this._queryService.results.segmentsAsObservable),
        debounceTime(1000)
      ); /* IMPORTANT: Limits the number of submissions to one per second. */

      /* Setup results subscription, which is triggered upon change to the result set. */
      const temporalResultsSubscription = this._queryService.observable.pipe(
        filter(f => f === 'ENDED'),
        mergeMap(f => this._queryService.results.temporalObjectsAsObservable),
        debounceTime(1000)
      ); /* IMPORTANT: Limits the number of submissions to one per second. */


      this._resultsSubscription = combineLatest([resultSubscription, this._eventbus.currentView(), this._eventbus.lastQuery()]).pipe(
        filter(([results, context, queryInfo]) => context != TemporalListComponent.COMPONENT_NAME),
        map(([results, context, queryInfo]) => DresTypeConverter.mapSegmentScoreContainer(context, results, queryInfo)),
        filter(submission => submission != null),
        mergeMap((submission: QueryResultLog) => {
          this._resultsLogTable.add(submission)

          /* Stop if no sessionId is set */
          if (!this._sessionId) {
            return EMPTY
          }

          /* Do some logging and catch HTTP errors. */
          console.log(`Submitting result log to DRES...`);
          return this._dresLog.postLogResult(this._sessionId, submission).pipe(
            tap(o => {
              console.log(`Successfully submitted result log to DRES!`);
            }),
            catchError((err) => {
              return of(`Failed to submit segment to DRES due to a HTTP error (${err.status}).`)
            })
          );
        })
      ).subscribe();

      /* Heavily duplicated code from above */
      this._temporalResultsSubscription = combineLatest([temporalResultsSubscription, this._eventbus.currentView(), this._eventbus.lastQuery()]).pipe(
        filter(([results, context, queryInfo]) => context === TemporalListComponent.COMPONENT_NAME),
        map(([results, context, queryInfo]) => DresTypeConverter.mapTemporalScoreContainer(context, results, queryInfo)),
        filter(submission => submission != null),
        mergeMap((submission: QueryResultLog) => {
          this._resultsLogTable.add(submission)

          /* Stop if no sessionId is set */
          if (!this._sessionId) {
            return EMPTY
          }

          /* Do some logging and catch HTTP errors. */
          console.log(`Submitting temporal result log to DRES...`);
          return this._dresLog.postLogResult(this._sessionId, submission).pipe(
            tap(o => {
              console.log(`Successfully submitted result log to DRES!`);
            }),
            catchError((err) => {
              return of(`Failed to submit segment to DRES due to a HTTP error (${err.status}).`)
            })
          );
        })
      ).subscribe();
    }

    /* Setup submission subscription, which is triggered manually. */
    this._submitSubscription = this._submitSubject.pipe(
      map(([segment, time]): [string, number?] => this.convertToAppropriateRepresentation(segment, time)),
      mergeMap(([segment, frame]) => {
        /* Submit, do some logging and catch HTTP errors. */
        return this._dresSubmit.getSubmit(null, segment, frame).pipe(
          tap((status: SuccessfulSubmissionsStatus) => {
            switch (status.submission) {
              case 'CORRECT':
                this._snackBar.open(status.description, null, {duration: Config.SNACKBAR_DURATION, panelClass: 'snackbar-success'});
                break;
              case 'WRONG':
                this._snackBar.open(status.description, null, {duration: Config.SNACKBAR_DURATION, panelClass: 'snackbar-warning'});
                break;
              default:
                this._snackBar.open(status.description, null, {duration: Config.SNACKBAR_DURATION});
                break;
            }
          }),
          catchError(err => {
            if (err.error) {
              this._snackBar.open(`Submissions error: ${err.error.description}`, null, {duration: Config.SNACKBAR_DURATION, panelClass: 'snackbar-error'})
            } else {
              this._snackBar.open(`Submissions error: ${err.message}`, null, {duration: Config.SNACKBAR_DURATION, panelClass: 'snackbar-error'})
            }
            return of(null)
          })
        )
      })
    ).subscribe();
  }

  /**
   *
   */
  get statusObservable(): Observable<SessionId> {
    return this._status
  }

  /**
   * Converts the given {MediaSegmentScoreContainer} and an optional timestamp to the exact form required by the respective
   * competition. DO YOUR CONVERSION and PRE-PROCESSING HERE please :-)
   *
   * @param segment The {MediaSegmentScoreContainer} to convert.
   * @param time The timepoint to convert.
   * @return Tuple of ID and optional frame number.
   */
  private convertToAppropriateRepresentation(segment: MediaSegmentScoreContainer, time?: number): [string, number?] {
    if (this._vbs) {
      let fps = Number.parseFloat(segment.objectScoreContainer.metadataForKey('technical.fps'));
      if (Number.isNaN(fps) || !Number.isFinite(fps)) {
        fps = VideoUtil.bestEffortFPS(segment);
      }
      return [segment.objectId.replace('v_', ''), VbsSubmissionService.timeToFrame(time, fps)]
    }
    if (this._lsc) {
      return [segment.segmentId.replace('is_', ''), time];
    }
    return [segment.segmentId, time];
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
