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
 * This service orchestrates Boolean requests using the Cineast API (WebSocket). The service is responsible for
 * issuing Boolean requests for the Boolean Query Mode, processing incoming responses and ranking of the requests.
 */
@Injectable()
export class BooleanService {

    /** The WebSocketWrapper currently used by QueryService to process and issue queries. */
    private _socket: WebSocketSubject<Message>;

    /** Number of elements returned for each Bool Term Component*/
    public _nmbofitems: Subject<Map<number, number>> = new Subject<Map<number, number>>();

    public _message: Subject<Message> = new Subject<Message>();

    /** Number of total available results in the database */
    public _totalresults: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    /** Saves each BoolTerm Component ID in order to give unique IDs to each new component */
    private _componentIDCounter = 0;
    /** Flag if newModel with the Term Preferences and ContainerWeights are to be used */
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

        this._config.configAsObservable.pipe(first()).subscribe(config => {
            const query = new BooleanLookup( new ReadableQueryConfig(null, config.get<Hint[]>('query.config.hints')), queries, type, componentID);
            this._socket.next(query)
        });
    }
    /**
     * This is where the magic happens: Subscribes to messages from the underlying WebSocket
     * and saves the results in a MAP
     * @param message
     */
    private onApiMessage(message: Message): void {
        this._message.next(message);
        const res = <BoolLookupMessage>message;
        if (this._totalresults.getValue() === 0) {
            this._totalresults.next(res.numberofElements);
        } else {
            this._nmbofitems.next(new Map([[res.componentID, res.numberofElements]]));
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
