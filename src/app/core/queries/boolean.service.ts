import {Inject, Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

import {Message} from '../../shared/model/messages/interfaces/message.interface';
import {QueryError} from '../../shared/model/messages/interfaces/responses/query-error.interface';
import {ResultsContainer} from '../../shared/model/results/scores/results-container.model';
import {ReadableQueryConfig} from '../../shared/model/messages/queries/readable-query-config.model';
import {Hint} from '../../shared/model/messages/interfaces/requests/query-config.interface';
import {filter, first} from 'rxjs/operators';
import {WebSocketFactoryService} from '../api/web-socket-factory.service';
import {HistoryService} from './history.service';
import {WebSocketSubject} from 'rxjs/webSocket';
import {EventBusService} from '../basics/event-bus.service';
import {AppConfig} from '../../app.config';
import {BooleanLookup} from '../../shared/model/messages/queries/boolean-lookup.model';

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
export class BooleanService {
    /** Subject that allows Observers to subscribe to changes emitted from the QueryService. */
    private _subject: Subject<QueryChange> = new Subject();
    /** The WebSocketWrapper currently used by QueryService to process and issue queries. */
    private _socket: WebSocketSubject<Message>;

    /** Rerank handler of the ResultsContainer. */
    private _interval_map: Map<string, number> = new Map();

    /** Results of a query. May be empty. */
    private _results: ResultsContainer;

    /** Flag indicating whether a query is currently being executed. */
    private _running = 0;

    private nmbofitems: number;



    constructor(@Inject(HistoryService) private _history,
                @Inject(WebSocketFactoryService) _factory: WebSocketFactoryService,
                @Inject(AppConfig) private _config: AppConfig,
                private _eventBusService: EventBusService) {
        _factory.asObservable().pipe(filter(ws => ws != null)).subscribe(ws => {
            this._socket = ws;
            this._socket.pipe(
                filter(msg => ['QR_BOOL'].indexOf(msg.messageType) > -1)
            ).subscribe((msg: Message) => this.onApiMessage(msg));
        });
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
    public findBool(entity: string, attribute: string, value: string): boolean {
        if (!this._socket) {
            console.warn('No socket available, not executing Boolean query');
            return false;
        }
        if (this._running > 0) {
            console.warn('There is already a query running');
        }
        this._config.configAsObservable.pipe(first()).subscribe(config => {
            const query = new BooleanLookup(entity, new ReadableQueryConfig(null, config.get<Hint[]>('query.config.hints')), attribute, value);
            this._socket.next(query)
            console.log(query);
        });
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
        console.log(message);
        switch (message.messageType) {

/*            case 'Q_BOOL':
                const qs = <QueryStart>message;
                console.time(`Query (${qs.queryId})`);
                /!*this.startNewFindAll(message);*!/
                break;*/
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
/*
    private startNewQuery(queryId: string) {
        /!* Start the actual query. *!/
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
*/

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
