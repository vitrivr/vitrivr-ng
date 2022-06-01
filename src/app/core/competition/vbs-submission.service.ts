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
import {AppConfig} from '../../app.config';
import {MetadataService} from '../../../../openapi/cineast';
import {LogService, QueryEventLog, QueryResultLog, SubmissionService, SuccessfulSubmissionsStatus, UserService} from '../../../../openapi/dres';
import {TemporalListComponent} from '../../results/temporal/temporal-list.component';
import {FilterService} from '../queries/filter.service';
import {ResultLogItem} from './logging/result-log-item';
import {SegmentScoreLogContainer} from './logging/segment-score-log-container';
import {QueryLogItem} from './logging/query-log-item';
import {DresService} from '../basics/dres.service';

/**
 * This service is used to submit segments to VBS web-service for the Video Browser Showdown challenge. Furthermore, if
 * the VBS mode is active, it listens to events emitted on the EventBus and maps them to VbsActions
 */
@Injectable()
export class VbsSubmissionService {
  /** The subject used to submit segments to the VBS service. */
  private _submitSubject = new Subject<[MediaSegmentScoreContainer, number]>();

  /** The subject used to submit textual information to the DRES server */
  private _submitTextSubject = new Subject<string>();

  /** Reference to the subscription that is used to issue submits to the VBS server. */
  private _submitSubscription: Subscription;

  /** Reference to the subscription that is used to issue textual submits to the DRES server. */
  private _submitTextSubscription: Subscription;

  /** Reference to the subscription that is used to submit updates to the results list. */
  private _resultsSubscription: Subscription;

  /** Reference to the subscription that is used to submit interaction logs on a regular basis to the VBS server. */
  private _interactionlogSubscription: Subscription;

  /** Table for persisting our result logs. */
  private _resultsLogTable: Dexie.Table<ResultLogItem, number>;

  /** Table for persisting our query logs. */
  private _queryLogTable: Dexie.Table<QueryLogItem, number>;

  /** Table for persisting DRES result logs. */
  private _dresResultsLogTable: Dexie.Table<QueryResultLog, number>;

  /** Table for persisting DRES submission logs */
  private _dresSubmissionLogTable: Dexie.Table<any, number>;

  /** Table for persisting DRES interaction logs. */
  private _dresInteractionLogTable: Dexie.Table<QueryEventLog, number>;

  /** Internal flag used to determine if VBS competition is running. */
  private _vbs = false;

  /** Internal flag used to determine if LSC competition is running. */
  private _lsc = false;

  /** Internal flag used to determine whether interactions, submissions and results should be logged. */
  private _log = false;

  /** SessionID retrieved from DRES endpoint, automatically connected via second tab. Does not support private mode */
  private _sessionId: string = undefined;

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
              _db: DatabaseService,
              private _filterService: FilterService,
              private _dresService: DresService) {

    /* This subscription registers the event-mapping, recording and submission stream if the VBS mode is active and un-registers it, if it is switched off! */
    _config.configAsObservable.subscribe(config => {
      if (!config) {
        return
      }
      this._log = config._config.competition.log
      if (this._log) {
        this._dresResultsLogTable = _db.db.table('log_results_dres');
        this._resultsLogTable = _db.db.table('log_results');
        this._queryLogTable = _db.db.table('log_queries');
        this._dresInteractionLogTable = _db.db.table('log_interaction_dres');
        this._dresSubmissionLogTable = _db.db.table('log_submission_dres');
        this.reset(config)
      }
    });
    this._dresService.statusObservable().subscribe({
      next: (user) => {
        if (user) {
          this._sessionId = user.sessionId;
        }
      },
      error: (e) => {
        console.error('failed to connect to DRES', e)
      }
    })

  }

  /**
   * Returns true uf VBS mode is active and properly configured (i.e. endpoint and team ID is specified).
   *
   * @return {boolean}
   */
  get isOn(): Observable<boolean> {
    return this._config.configAsObservable.pipe(
      map(c => c.dresEndpointRest == null)
    )
  }

  /**
   * Convenience method to transform the timestamp within a video into a frame index.
   *
   * @param {number} timestamp Timestamp within the video.
   * @param {number} fps The FPS of the video.
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
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

  public submitText(text: string) {
    if (this.isOn) {
      // TODO how to log textual submissions?
      console.log(`Submitting text ${text}`);
      this._submitTextSubject.next(text);
    }
  }

  /**
   * Submits the provided SegmentScoreContainer and the given time to the VBS endpoint.
   *
   * @param {MediaSegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
   * @param time The video timestamp to submit.
   */
  public submit(segment: MediaSegmentScoreContainer, time: number) {
    if (this._log) {
      this._dresSubmissionLogTable.add([segment.segmentId, time])
    }
    console.debug(`Submitting segment ${segment.segmentId} @ ${time}`);
    this._submitSubject.next([segment, time]);
    this._selection.add(this._selection._available[0], segment.segmentId);
  }

  /**
   * Resets the VBSSubmissionService, re-initiating all subscriptions.
   */
  public reset(config: Config) {
    /* Update local flags. */
    this._lsc = config._config.competition.lsc
    this._vbs = config._config.competition.vbs;

    /* Run cleanup. */
    this.cleanup();

    /* Setup interaction log subscription, which runs in a regular interval. */
    if (this._log) {
      this._interactionlogSubscription = DresTypeConverter.mapEventStream(this._eventbus.observable()).pipe(
        bufferTime(config._config.competition.loginterval),
        map((events: QueryEventLog[]) => {
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
          this._dresInteractionLogTable.add(submission);

          /* Stop if no sessionId is set */
          if (!this._sessionId) {
            return EMPTY
          }

          /* Submit Log entry to DRES. */
          console.log(`Submitting interaction log to DRES.`);
          return this._dresLog.postApiV1LogQuery(this._sessionId, submission).pipe(
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
      const resultSubscription: Observable<MediaSegmentScoreContainer[]> = this._queryService.observable.pipe(
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

      /* Setup results subscription, which is triggered upon change to the result set. */
      const filterSubscription = this._filterService.filterSubject.pipe(
        debounceTime(1000)
      ); /* IMPORTANT: Limits the number of filter updates to one per second. */

      this._queryService.observable.pipe(
        filter(el => el == 'STARTED'),
        tap(() => {
          const task = this._dresService.activeTask()
          const run = this._dresService.activeRun()
          const query = this._queryService.lastQueryIssued()
          const logItem: QueryLogItem = {
            query: query,
            dresTask: task,
            dresRun: run,
          }
          console.log('logging query')
          this._queryLogTable.add(logItem)
        })
      ).subscribe()

      this._resultsSubscription = combineLatest([resultSubscription, temporalResultsSubscription, this._eventbus.currentView(), filterSubscription]).pipe(
        debounceTime(200),
        filter(() => {
          if (this._eventbus.lastQueryInteractionEvent() === null) {
            console.error('no query logged for interaction logging, not logging anything')
            return false
          }
          if (this._queryService.lastQueryIssued() === null) {
            console.error('no query logged in query service, not logging anything')
            return false
          }
          return true
        }),
        tap(([results, temporalResults, context, filterInfo]) => {
          console.log(`logging results`);
          const query = this._queryService.lastQueryIssued()
          let logResults: SegmentScoreLogContainer[]
          switch (context) {
            case TemporalListComponent.COMPONENT_NAME:
              logResults = temporalResults.flatMap(seq => seq.segments.map(c => new SegmentScoreLogContainer(seq.object.objectid, c.segmentId, c.startabs, c.endabs, seq.score)))
              break;
            default:
              logResults = results.map(c => new SegmentScoreLogContainer(c.objectId, c.segmentId, c.startabs, c.endabs, c.score))
          }
          const logItem: ResultLogItem = {
            filter: filterInfo,
            query: query,
            results: logResults
          };
          this._resultsLogTable.add(logItem);
        }),
        map(([results, temporalResults, context, filterInfo]) => {
          const query = this._eventbus.lastQueryInteractionEvent()
          switch (context) {
            case TemporalListComponent.COMPONENT_NAME:
              return DresTypeConverter.mapTemporalScoreContainer(context, temporalResults, query)
            default:
              return DresTypeConverter.mapSegmentScoreContainer(context, results, query)
          }
        }),
        filter(submission => submission != null),
        mergeMap((submission: QueryResultLog) => {

          /* Stop if no sessionId is set */
          if (!this._sessionId) {
            return EMPTY
          }
          this._dresResultsLogTable.add(submission)

          /* Do some logging and catch HTTP errors. */
          console.log(`Submitting result log to DRES...`);
          return this._dresLog.postApiV1LogResult(this._sessionId, submission).pipe(
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
        /* Stop if no sessionId is set */
        if (!this._sessionId) {
          return EMPTY
        }

        this._dresSubmissionLogTable.add([segment, frame])
        /* Submit, do some logging and catch HTTP errors. */
        return this._dresSubmit.getApiV1Submit(null, segment, null, frame).pipe(
          tap((status: SuccessfulSubmissionsStatus) => {
            this.handleSubmissionResponse(status);
          }),
          catchError(err => {
            return this.handleSubmissionError(err);
          })
        )
      })
    ).subscribe();

    /* Setup submission subscription, which is triggered manually. */
    this._submitTextSubscription = this._submitTextSubject.pipe(
      mergeMap((text) => {
        this._dresSubmissionLogTable.add(text)
        /* Submit, do some logging and catch HTTP errors. */
        return this._dresSubmit.getApiV1Submit(null, null, text).pipe(
          tap((status: SuccessfulSubmissionsStatus) => {
            this.handleSubmissionResponse(status);
          }),
          catchError(err => {
            return this.handleSubmissionError(err);
          })
        )
      })
    ).subscribe()
  }


  private handleSubmissionError(err) {
    if (err.error) {
      this._snackBar.open(`Submissions error: ${err.error.description}`, null, {duration: Config.SNACKBAR_DURATION, panelClass: 'snackbar-error'})
    } else {
      this._snackBar.open(`Submissions error: ${err.message}`, null, {duration: Config.SNACKBAR_DURATION, panelClass: 'snackbar-error'})
    }
    return of(null)
  }

  private handleSubmissionResponse(status: SuccessfulSubmissionsStatus) {
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
      let fps = Number.parseFloat(segment.objectScoreContainer._metadata.get('technical.fps'));
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
    if (this._submitTextSubscription != null) {
      this._submitTextSubscription.unsubscribe();
      this._submitTextSubscription = null;
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
