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
import {BooleanLookup, BooleanLookupType} from '../../shared/model/messages/queries/boolean-lookup.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {OBJExporter} from 'three/examples/jsm/exporters/OBJExporter';
import {Observer} from 'rxjs/Observer';
import {BoolLookupMessage} from '../../shared/model/messages/interfaces/responses/bool-lookup.interface';
import {BoolOperator} from '../../query/containers/bool/bool-attribute';
import {BooleanLookupQuery} from '../../shared/model/messages/queries/boolean-lookupquery.model';
import {MiscService} from '../../../../openapi/cineast';

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

    /** Results of a query. May be empty. */
    private _results: ResultsContainer;

    /** Flag indicating whether a query is currently being executed. */
    private _running = 0;

    /** Number of elements returned for each Bool Term Component*/
    public _nmbofitems: Subject<Map<number, number>> = new Subject<Map<number, number>>();

    public _message: Subject<Message> = new Subject<Message>();

    /** Number of total available results in the database */
    public _totalresults: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    /** Saves each BoolTerm Component ID in order to give unique IDs to each new component */
    private _componentIDCounter = 0;

    private newModel: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public newModelObs: Observable<boolean> = this.newModel.asObservable();

    constructor(@Inject(HistoryService) private _history,
                @Inject(WebSocketFactoryService) _factory: WebSocketFactoryService,
                @Inject(AppConfig) private _config: AppConfig,
                @Inject(MiscService) private _miscService: MiscService,
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
     * Starts a new BooleanLookup query. Success is indicated by the return value.
     *
     * Note: Similarity queries can only be started if no query is currently running.
     *
     * @param containers The list of QueryContainers used to create the query.
     * @returns {boolean} true if query was issued, false otherwise.
     */
    public findBool(queries: BooleanLookupQuery[], type: BooleanLookupType, componentID: number): boolean {
        if (!this._socket) {
            console.warn('No socket available, not executing Boolean query');
            return false;
        }
        if (this._running > 0) {
            console.warn('There is already a query running');
        }
        this._config.configAsObservable.pipe(first()).subscribe(config => {
            const query = new BooleanLookup( new ReadableQueryConfig(null, config.get<Hint[]>('query.config.hints')), queries, type, componentID);
            console.log(query);
            this._socket.next(query)
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
        this._message.next(message);
        const res = <BoolLookupMessage>message;
        if (this._totalresults.getValue() === 0) {
            this._totalresults.next(res.numberofElements);
        } else {
            this._nmbofitems.next(new Map([[res.componentID, res.numberofElements]]));
            console.log(new Map([[res.componentID, res.numberofElements]]));
        }
    }

    public setModel(value: boolean) {
        this.newModel.next(value);
    }

    public getComponentID(): number {
        this._componentIDCounter = this._componentIDCounter + 1;
        return this._componentIDCounter;
    }
}
