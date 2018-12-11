import {Inject, Injectable} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {Subject} from "rxjs";

import {Message} from "../../shared/model/messages/interfaces/message.interface";
import {QueryStart} from "../../shared/model/messages/interfaces/responses/query-start.interface";
import {SegmentQueryResult} from "../../shared/model/messages/interfaces/responses/query-result-segment.interface";
import {SimilarityQueryResult} from "../../shared/model/messages/interfaces/responses/query-result-similarty.interface";
import {ObjectQueryResult} from "../../shared/model/messages/interfaces/responses/query-result-object.interface";
import {SimilarityQuery} from "../../shared/model/messages/queries/similarity-query.model";
import {MoreLikeThisQuery} from "../../shared/model/messages/queries/more-like-this-query.model";
import {QueryError} from "../../shared/model/messages/interfaces/responses/query-error.interface";
import {ResultsContainer} from "../../shared/model/results/scores/results-container.model";
import {NeighboringSegmentQuery} from "../../shared/model/messages/queries/neighboring-segment-query.model";
import {ReadableQueryConfig} from "../../shared/model/messages/queries/readable-query-config.model";
import {ConfigService} from "../basics/config.service";
import {Config} from "../../shared/model/config/config.model";
import {Hint} from "../../shared/model/messages/interfaces/requests/query-config.interface";
import {FeatureCategories} from "../../shared/model/results/feature-categories.model";
import {QueryContainerInterface} from "../../shared/model/queries/interfaces/query-container.interface";
import {filter, first} from "rxjs/operators";
import {WebSocketFactoryService} from "../api/web-socket-factory.service";
import {SegmentMetadataQueryResult} from "../../shared/model/messages/interfaces/responses/query-result-segment-metadata.interface";
import {ObjectMetadataQueryResult} from "../../shared/model/messages/interfaces/responses/query-result-object-metadata.interface";
import {HistoryService} from "./history.service";
import {HistoryContainer} from "../../shared/model/internal/history-container.model";
import {WebSocketSubject} from "rxjs/webSocket";

/**
 *  Types of changes that can be emitted from the QueryService.
 *
 *  STARTED     - New query was started.
 *  ENDED       - Processing of the query has ended.
 *  UPDATED     - New information concerning the running query is available OR post-execution refinements were performed.
 *  FEATURE     - A new feature has become available.
 */
export type QueryChange = "STARTED" | "ENDED" | "ERROR" | "UPDATED" | "FEATURE" | "CLEAR";

/**
 * This service orchestrates similarity requests using the Cineast API (WebSocket). The service is responsible for
 * issuing findSimilar requests, processing incoming responses and ranking of the requests.
 */
@Injectable()
export class QueryService {
    /** Flag indicating whether a query is currently being executed. */
    private _running : number = 0;

    /** Subject that allows Observers to subscribe to changes emitted from the QueryService. */
    private _subject : Subject<QueryChange> = new Subject();

    /** Results of a query. May be empty. */
    private _results: ResultsContainer;

    /** The Vitrivr NG configuration as observable */
    private _config: Observable<Config>;

    /** The WebSocketWrapper currently used by QueryService to process and issue queries. */
    private _socket: WebSocketSubject<Message>;

    /**
     * Default constructor.
     *
     * @param _history
     * @param _factory Reference to the WebSocketFactoryService. Gets injected by DI.
     * @param _config
     */
    constructor(@Inject(HistoryService) private _history,
                @Inject(WebSocketFactoryService) _factory : WebSocketFactoryService,
                @Inject(ConfigService) _config: ConfigService) {
        this._config = _config.asObservable();
        _factory.asObservable().pipe(filter(ws => ws != null)).subscribe(ws => {
            this._socket = ws;
            this._socket.pipe(
                filter(msg => ["QR_START","QR_END","QR_ERROR","QR_SIMILARITY","QR_OBJECT","QR_SEGMENT","QR_METADATA_S"].indexOf(msg.messageType) > -1)
            ).subscribe((msg: Message) => this.onApiMessage(msg));
        })
    }
    /**
     * Starts a new similarity query. Success is indicated by the return value.
     *
     * Note: Similarity queries can only be started if no query is currently running.
     *
     * @param containers The list of QueryContainers used to create the query.
     * @returns {boolean} true if query was issued, false otherwise.
     */
    public findSimilar(containers : QueryContainerInterface[]) : boolean {
        if (this._running > 0) return false;
        if (!this._socket) return false;
        this._config.pipe(first()).subscribe(config => {
            this._socket.next(new SimilarityQuery(containers, new ReadableQueryConfig(null, config.get<Hint[]>('query.config.hints'))));
        });
    }

    /**
     * Starts a new MoreLikeThis query. Success is indicated by the return value.
     *
     * Note: Similarity queries can only be started if no query is currently running.
     *
     * @param segmentId The ID of the segment that should serve as example.
     * @param categories Optional list of category names that should be used for More-Like-This.
     * @returns {boolean} true if query was issued, false otherwise.
     */
    public findMoreLikeThis(segmentId: string, categories?: string[]) : boolean {
        if (this._running > 0) return false;
        if (!this._socket) return false;

        /* Use categories from last query AND the default categories for MLT. */
        this._config.pipe(first()).subscribe(config => {
            let categories = this._results.features.map(f => f.name);
            config.get<FeatureCategories[]>('mlt').filter(c => categories.indexOf(c) == -1).forEach(c => categories.push(c));
            if (categories.length > 0) {
                this._socket.next(new MoreLikeThisQuery(segmentId, categories, new ReadableQueryConfig(null, config.get<Hint[]>('query.config.hints'))));
            }
        });

        return true;
    }

    /**
     * Starts a new MoreLikeThis query. Success is indicated by the return value. The results of this query will always
     * be appended to the existing result set!
     *
     * Note: Queries can only be started if no query is currently ongoing.
     *
     * @param {string} segmentId The ID of the segment for which neighbors should be fetched.
     * @param {number} count Number of segments on each side.
     */
    public findNeighboringSegments(segmentId: string, count?: number) {
        if (!this._results) return false;
        if (!this._socket) return false;
        this._socket.next(new NeighboringSegmentQuery(segmentId, new ReadableQueryConfig(this.results.queryId), count));
    }

    /**
     * Loads a HistoryContainer and replaces the current snapshot.
     *
     * @param snapshot HistoryContainer that should be loaded.
     */
    public load(snapshot: HistoryContainer) {
        if (this._running > 0) return false;
        let deserialized = ResultsContainer.deserialize(snapshot.results);
        if (deserialized) {
            this._results = deserialized;
            this._subject.next("STARTED");
            this._subject.next("ENDED");
        }
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
    get observable() : Observable<QueryChange> {
        return this._subject.asObservable();
    }

    /**
     * This is where the magic happens: Subscribes to messages from the underlying WebSocket and orchestrates the
     * assembly of the individual pieces of QueryResults.
     *
     * @param message
     */
    private onApiMessage(message: Message): void {
        switch (message.messageType) {
            case "QR_START":
                let qs = <QueryStart>message;
                console.time(`Query (${qs.queryId})`);
                this.startNewQuery(qs.queryId);
                break;
            case "QR_OBJECT":
                let obj = <ObjectQueryResult>message;
                if (this._results && this._results.processObjectMessage(obj)) this._subject.next("UPDATED");
                break;
            case "QR_SEGMENT":
                let seg = <SegmentQueryResult>message;
                if (this._results && this._results.processSegmentMessage(seg)) this._subject.next("UPDATED");
                break;
            case "QR_SIMILARITY":
                let sim = <SimilarityQueryResult>message;
                if (this._results && this._results.processSimilarityMessage(sim)) this._subject.next("UPDATED");
                break;
            case "QR_METADATA_S":
                let mets = <SegmentMetadataQueryResult>message;
                if (this._results && this._results.processSegmentMetadataMessage(mets)) this._subject.next("UPDATED");
                break;
            case "QR_METADATA_O":
                let meto = <ObjectMetadataQueryResult>message;
                if (this._results && this._results.processObjectMetadataMessage(meto)) this._subject.next("UPDATED");
                break;
            case "QR_ERROR":
                console.timeEnd(`Query (${(<QueryError>message).queryId})`);
                this.errorOccurred(<QueryError>message);
                break;
            case "QR_END":
                console.timeEnd(`Query (${(<QueryError>message).queryId})`);
                this.finalizeQuery();
                break;
        }
    }

    /**
     * Updates the local state in response to a QR_START message. This method triggers an observable change in the QueryService class.
     *
     * @param queryId ID of the new query. Used to associate responses.
     */
    private startNewQuery(queryId : string) {
        /* Start the actual query. */
        if (!this._results || (this._results && this._results.queryId != queryId)) this._results = new ResultsContainer(queryId);
        this._running += 1;
        this._subject.next("STARTED" as QueryChange);
    }

    /**
     * Finalizes a running RunningQueries and does some cleanup.
     *
     * This method triggers an observable change in the QueryService class.
     */
    private finalizeQuery() {
        this._running -= 1;
        this._subject.next("ENDED" as QueryChange);
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
        this._running -= 1;
        this._subject.next("ERROR" as QueryChange);
        console.log("QueryService received error: " + message.message);
    }

    /**
     * Clears the results and aborts the current query from being executed
     *
     * (Warning: The abort is not propagated to the Cineast API, which might still be running).
     */
    public clear() {
        /* If query is still running, stop it. */
        if (this._running) {
            this._subject.next("ENDED" as QueryChange);
            this._running = 0;
        }

        /* Complete the ResultsContainer and release it. */
        if (this._results) {
            this._results.complete();
            this._results = null;
        }

        /* Publish Event. */
        this._subject.next("CLEAR");
    }
}
