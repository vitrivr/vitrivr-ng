import {Inject, Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

import {Message} from '../../shared/model/messages/interfaces/message.interface';
import {QueryStart} from '../../shared/model/messages/interfaces/responses/query-start.interface';
import {SimilarityQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-similarty.interface';
import {MoreLikeThisQuery} from '../../shared/model/messages/queries/more-like-this-query.model';
import {QueryError} from '../../shared/model/messages/interfaces/responses/query-error.interface';
import {ResultsContainer} from '../../shared/model/results/scores/results-container.model';
import {NeighboringSegmentQuery} from '../../shared/model/messages/queries/neighboring-segment-query.model';
import {ReadableQueryConfig} from '../../shared/model/messages/queries/readable-query-config.model';
import {Hint} from '../../shared/model/messages/interfaces/requests/query-config.interface';
import {FeatureCategories} from '../../shared/model/results/feature-categories.model';
import {QueryContainerInterface} from '../../shared/model/queries/interfaces/query-container.interface';
import {filter, first} from 'rxjs/operators';
import {WebSocketFactoryService} from '../api/web-socket-factory.service';
import {SegmentMetadataQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-segment-metadata.interface';
import {ObjectMetadataQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-object-metadata.interface';
import {HistoryService} from './history.service';
import {HistoryContainer} from '../../shared/model/internal/history-container.model';
import {WebSocketSubject} from 'rxjs/webSocket';
import {SegmentQuery} from '../../shared/model/messages/queries/segment-query.model';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {TemporalFusionFunction} from '../../shared/model/results/fusion/temporal-fusion-function.model';
import {StagedSimilarityQuery} from '../../shared/model/messages/queries/staged-similarity-query.model';
import {TemporalQuery} from '../../shared/model/messages/queries/temporal-query.model';
import {ContextKey, InteractionEventComponent} from '../../shared/model/events/interaction-event-component.model';
import {InteractionEventType} from '../../shared/model/events/interaction-event-type.model';
import {BoolQueryTerm} from '../../shared/model/queries/bool-query-term.model';
import {TextQueryTerm} from '../../shared/model/queries/text-query-term.model';
import {TagQueryTerm} from '../../shared/model/queries/tag-query-term.model';
import {InteractionEvent} from '../../shared/model/events/interaction-event.model';
import {EventBusService} from '../basics/event-bus.service';
import {AppConfig} from '../../app.config';
import {MediaObjectQueryResult, MediaSegmentQueryResult} from '../../../../openapi/cineast';

/**
 *  Types of changes that can be emitted from the QueryService.
 *
 *  STARTED     - New query was started.
 *  ENDED       - Processing of the query has ended.
 *  UPDATED     - New information concerning the running query is available OR post-execution refinements were performed.
 *  FEATURE     - A new feature has become available.
 */
export type QueryChange = 'STARTED' | 'ENDED' | 'ERROR' | 'UPDATED' | 'FEATURE' | 'CLEAR';

/**
 * This service orchestrates similarity requests using the Cineast API (WebSocket). The service is responsible for
 * issuing findSimilar requests, processing incoming responses and ranking of the requests.
 */
@Injectable()
export class QueryService {
  /** Subject that allows Observers to subscribe to changes emitted from the QueryService. */
  private _subject: Subject<QueryChange> = new Subject();
  /** The WebSocketWrapper currently used by QueryService to process and issue queries. */
  private _socket: WebSocketSubject<Message>;
  private _scoreFunction: string;
  /** Rerank handler of the ResultsContainer. */
  private _interval_map: Map<string, number> = new Map();

  /** Results of a query. May be empty. */
  private _results: ResultsContainer;

  /** Flag indicating whether a query is currently being executed. */
  private _running = 0;

  constructor(@Inject(HistoryService) private _history,
              @Inject(WebSocketFactoryService) _factory: WebSocketFactoryService,
              @Inject(AppConfig) private _config: AppConfig,
              private _eventBusService: EventBusService) {
    _factory.asObservable().pipe(filter(ws => ws != null)).subscribe(ws => {
      this._socket = ws;
      this._socket.pipe(
        filter(msg => ['QR_START', 'QR_END', 'QR_ERROR', 'QR_SIMILARITY', 'QR_OBJECT', 'QR_SEGMENT', 'QR_METADATA_S', 'QR_METADATA_O'].indexOf(msg.messageType) > -1)
      ).subscribe((msg: Message) => this.onApiMessage(msg));
    });
    this._config.configAsObservable.subscribe(config => {
      this._scoreFunction = config.get('query.scoreFunction');
      if (this._results) {
        this._results.setScoreFunction(this._scoreFunction);
      }
    })
  }

  /**
   * Getter for results.
   *
   * @return {ResultsContainer}
   */
  get results(): ResultsContainer {
    return this._results;
  }

  /**
   * Getter for running.
   *
   * @return {boolean}
   */
  get running(): boolean {
    return this._running > 0;
  }

  /**
   * Returns an Observable that allows an Observer to be notified about
   * state changes in the QueryService (RunningQueries, Finished, Resultset updated).
   *
   * @returns {Observable<QueryChange>}
   */
  get observable(): Observable<QueryChange> {
    return this._subject.asObservable();
  }

  /**
   * Starts a new similarity query. Success is indicated by the return value.
   *
   * Note: Similarity queries can only be started if no query is currently running.
   *
   * @param containers The list of QueryContainers used to create the query.
   * @returns {boolean} true if query was issued, false otherwise.
   */
  public findSimilar(containers: QueryContainerInterface[]): boolean {
    if (!this._socket) {
      console.warn('No socket available, not executing similarity query');
      return false;
    }
    if (this._running > 0) {
      console.warn('There is already a query running');
    }
    this._config.configAsObservable.pipe(first()).subscribe(config => {
      TemporalFusionFunction.queryContainerCount = containers.length;
      const query = new TemporalQuery(containers.map(container => new StagedSimilarityQuery(container.stages, null)), new ReadableQueryConfig(null, config.get<Hint[]>('query.config.hints')));
      this._socket.next(query)
    });

    /** Log Interaction */
    const _components: InteractionEventComponent[] = []
    containers.forEach(container => {
      _components.push(new InteractionEventComponent(InteractionEventType.NEW_QUERY_CONTAINER))
      container.stages.forEach(s => {
        _components.push(new InteractionEventComponent(InteractionEventType.NEW_QUERY_STAGE))
        s.terms.forEach(t => {
          const context: Map<ContextKey, any> = new Map();
          context.set('q:categories', t.categories);
          context.set('q:value', 'null')
          switch (t.type) {
            case 'IMAGE':
              _components.push(new InteractionEventComponent(InteractionEventType.QUERY_IMAGE, context));
              return;
            case 'AUDIO':
              _components.push(new InteractionEventComponent(InteractionEventType.QUERY_AUDIO, context));
              return;
            case 'MOTION':
              _components.push(new InteractionEventComponent(InteractionEventType.QUERY_MOTION, context));
              return;
            case 'MODEL3D':
              _components.push(new InteractionEventComponent(InteractionEventType.QUERY_MODEL3D, context));
              return;
            case 'SEMANTIC':
              _components.push(new InteractionEventComponent(InteractionEventType.QUERY_SEMANTIC, context));
              return;
            case 'TEXT':
              context.set('q:value', (t as TextQueryTerm).data); // data = plaintext
              _components.push(new InteractionEventComponent(InteractionEventType.QUERY_FULLTEXT, context));
              return;
            case 'BOOLEAN':
              context.set('q:value', (t as BoolQueryTerm).terms)
              _components.push(new InteractionEventComponent(InteractionEventType.QUERY_BOOLEAN, context));
              return;
            case 'TAG':
              context.set('q:value', (t as TagQueryTerm).tags);
              _components.push(new InteractionEventComponent(InteractionEventType.QUERY_TAG, context));
              return;
          }
        })
      })
    });
    this._eventBusService.publish(new InteractionEvent(..._components))
  }

  /**
   * Starts a new More-Like-This query. Success is indicated by the return value.
   *
   * Note: More-Like-This queries can only be started if no query is currently running.
   *
   * @param segment The {SegmentScoreContainer} that should serve as example.
   * @param categories Optional list of category names that should be used for More-Like-This.
   * @returns {boolean} true if query was issued, false otherwise.
   */
  public findMoreLikeThis(segment: SegmentScoreContainer, categories: string[] = []): boolean {
    if (this._running > 0) {
      console.log('an mlt query is already running, cannot perform mlt');
      return false;
    }
    if (!this._socket) {
      console.log('no socket available, cannot perform mlt');
      return false;
    }
    if (!segment) {
      console.log('segment undefined, cannot perform mlt');
      return false;
    }
    if (!segment.objectScoreContainer) {
      console.log(`object score container for segment ${segment.segmentId} undefined, cannot perform mlt`);
      return false;
    }
    if (!segment.objectScoreContainer.mediatype) {
      console.log(`no object mediatype available for segment ${segment.segmentId} undefined, cannot perform mlt`);
      return false;
    }


    /* Emit a MLT event on the bus. */
    const context: Map<ContextKey, any> = new Map();
    context.set('q:value', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.MLT, context)))

    /* Use categories from last query AND the default categories for MLT. */
    this._config.configAsObservable.pipe(first()).subscribe(config => {
      if (!config) {
        console.log('config undefined, cannot perform mlt');
        return;
      }
      const _cat = config.get<FeatureCategories[]>(`mlt.${segment.objectScoreContainer.mediatype}`);
      if (!_cat) {
        console.log('no mlt categories available. printing first config, then segment');
        console.log(config);
        console.log(segment);
        return;
      }
      _cat
        .filter(c => categories.indexOf(c) === -1)
        .forEach(c => categories.push(c));
      if (categories.length > 0) {
        this._socket.next(new MoreLikeThisQuery(segment.segmentId, categories, new ReadableQueryConfig(null, config.get<Hint[]>('query.config.hints'))));
      }
    });

    return true;
  }

  /**
   * Performs a lookup for the (temporal) neighbours of a specific segment. Success is indicated by the return value.
   *
   * Note: It is always possible to perform a lookup, as long a query has already been issued. Result of the lookup
   * will be added to the current results.
   *
   * @param {string} segmentId The ID of the segment for which neighbors should be fetched.
   * @param {number} count Number of segments on EACH side.
   * @returns {boolean} true if query was issued, false otherwise.
   */
  public lookupNeighboringSegments(segmentId: string, count?: number) {
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXPAND, context)));
    if (!this._results) {
      console.log('no results, not looking up neighboring segments');
      return false;
    }
    if (!this._socket) {
      console.log('no socket, not looking up neighboring segments');
      return false;
    }
    this._socket.next(new NeighboringSegmentQuery(segmentId, new ReadableQueryConfig(this.results.queryId), count));
    return true;
  }

  /**
   * Performs a lookup for a specific segment.
   *
   * Note: It is always possible to perform a lookup, as long a query has already been issued. Result of the lookup
   * will be added to the current results.
   *
   * @param segmentId The segmentId of the segment that is required.
   * @returns {boolean} true if query was issued, false otherwise.
   */
  public lookupSegment(segmentId: string) {
    if (!this._results) {
      return false;
    }
    if (!this._socket) {
      return false;
    }
    this._socket.next(new SegmentQuery(segmentId, new ReadableQueryConfig(this.results.queryId)));
    return true;
  }

  /**
   * Loads a HistoryContainer and replaces the current snapshot.
   *
   * @param snapshot HistoryContainer that should be loaded.
   */
  public load(snapshot: HistoryContainer) {
    if (this._running > 0) {
      return false;
    }
    const deserialized = ResultsContainer.deserialize(snapshot.results);
    if (deserialized) {
      this._results = deserialized;
      if (this._scoreFunction) {
        this._results.setScoreFunction(this._scoreFunction);
      }
      this._subject.next('STARTED');
      this._subject.next('ENDED');
    }
  }

  /**
   * Clears the results and aborts the current query from being executed
   *
   * (Warning: The abort is not propagated to the Cineast API, which might still be running).
   */
  public clear() {
    /* If query is still running, stop it. */
    if (this._running) {
      this._subject.next('ENDED' as QueryChange);
      this._running = 0;
    }

    /* Complete the ResultsContainer and release it. */
    if (this._results) {
      this._results.complete();
      this._results = null;
    }

    /* Publish Event. */
    this._subject.next('CLEAR');
  }

  /**
   * This is where the magic happens: Subscribes to messages from the underlying WebSocket and orchestrates the
   * assembly of the individual pieces of QueryResults.
   *
   * @param message
   */
  private onApiMessage(message: Message): void {
    switch (message.messageType) {
      case 'QR_START':
        const qs = <QueryStart>message;
        console.time(`Query (${qs.queryId})`);
        this.startNewQuery(qs.queryId);
        break;
      case 'QR_OBJECT':
        const obj = <MediaObjectQueryResult>message;
        if (this._results && this._results.processObjectMessage(obj)) {
          this._subject.next('UPDATED');
        }
        break;
      case 'QR_SEGMENT':
        const seg = <MediaSegmentQueryResult>message;
        if (this._results && this._results.processSegmentMessage(seg)) {
          this._subject.next('UPDATED');
        }
        break;
      case 'QR_SIMILARITY':
        const sim = <SimilarityQueryResult>message;
        if (this._results && this._results.processSimilarityMessage(sim)) {
          this._subject.next('UPDATED');
        }
        break;
      case 'QR_METADATA_S':
        const mets = <SegmentMetadataQueryResult>message;
        if (this._results && this._results.processSegmentMetadataMessage(mets)) {
          this._subject.next('UPDATED');
        }
        break;
      case 'QR_METADATA_O':
        const meto = <ObjectMetadataQueryResult>message;
        if (this._results && this._results.processObjectMetadataMessage(meto)) {
          this._subject.next('UPDATED');
        }
        break;
      case 'QR_ERROR':
        console.timeEnd(`Query (${(<QueryError>message).queryId})`);
        this.errorOccurred(<QueryError>message);
        break;
      case 'QR_END':
        console.timeEnd(`Query (${(<QueryError>message).queryId})`);
        this.finalizeQuery((<QueryError>message).queryId);
        break;
    }
  }

  /**
   * Updates the local state in response to a QR_START message. This method triggers an observable change in the QueryService class.
   *
   * @param queryId ID of the new query. Used to associate responses.
   */
  private startNewQuery(queryId: string) {
    /* Start the actual query. */
    if (!this._results || (this._results && this._results.queryId !== queryId)) {
      this._results = new ResultsContainer(queryId);
      this._interval_map.set(queryId, window.setInterval(() => this._results.checkUpdate(), 2500));
      if (this._scoreFunction) {
        this._results.setScoreFunction(this._scoreFunction);
      }
    }
    this._running += 1;
    this._subject.next('STARTED' as QueryChange);
  }

  /**
   * Finalizes a running RunningQueries and does some cleanup.
   *
   * This method triggers an observable change in the QueryService class.
   */
  private finalizeQuery(queryId: string) {
    // be sure that updates are checked one last time
    window.clearInterval(this._interval_map.get(queryId))
    this._interval_map.delete(queryId)
    this._results.doUpdate();
    this._running -= 1;
    this._subject.next('ENDED' as QueryChange);
    if (this._results.segmentCount > 0) {
      this._history.append(this._results);
    }
  }

  /**
   * Finalizes a running RunningQueries and does some cleanup after an error was reported by Cineast.
   *
   * This method triggers an observable change in the QueryService class.
   */
  private errorOccurred(message: QueryError) {
    if (this._interval_map.has(message.queryId)) {
      window.clearInterval(this._interval_map.get(message.queryId));
      this._interval_map.delete(message.queryId);
    }
    this._running -= 1;
    this._subject.next('ERROR' as QueryChange);
    console.log('QueryService received error: ' + message.message);
  }
}
