import {Component, HostListener, OnInit} from '@angular/core';
import {QueryService} from "../core/queries/query.service";
import {QueryContainerInterface} from "../shared/model/queries/interfaces/query-container.interface";
import {QueryContainer} from "../shared/model/queries/query-container.model";
import {EventBusService} from "../core/basics/event-bus.service";
import {ContextKey, InteractionEventComponent} from "../shared/model/events/interaction-event-component.model";
import {InteractionEventType} from "../shared/model/events/interaction-event-type.model";
import {InteractionEvent} from "../shared/model/events/interaction-event.model";
import {from} from "rxjs";
import {bufferCount, flatMap, map} from "rxjs/operators";


@Component({
    moduleId: module.id,
    selector: 'research',
    templateUrl: 'research.component.html'
})
export class ResearchComponent implements OnInit {
    /** QueryContainer's held by the current instance of ResearchComponent. */
    public readonly containers : QueryContainerInterface[] = [];

    /** A timestamp used to store the timestamp of the last Enter-hit by the user. Required for shortcut detection. */
    private _lastEnter: number = 0;

    /**
     * Constructor for ResearchComponent. Injects the gloal QueryService and EventBusService instance.
     *
     * @param _queryService QueryService instance (Singleton) used to issue queries.
     * @param _eventBus EventBusService instance (Singleton) used to publish user interaction information.
     */
    constructor(private _queryService: QueryService, private _eventBus: EventBusService) {}

    /**
     * Lifecycle Callback (OnInit): Adds a new QueryTermContainer.
     */
    public ngOnInit() {
        this.addQueryTermContainer();
    }

    /**
     * Adds a new QueryContainer to the list of QueryContainers.
     */
    public addQueryTermContainer() {
        this.containers.push(new QueryContainer())
    }

    /**
     * Triggers the similarity onSearchClicked by packing all configured QueryContainers into a single
     * SimilarityQuery message, and submitting that message to the QueryService.
     */
    public onSearchClicked() {
        this._queryService.findSimilar(this.containers);
        from(this.containers).pipe(
            flatMap(c => c.terms),
            map(t => {
               let context: Map<ContextKey,any> = new Map();
               context.set("q:categories", t.categories);
               switch (t.type) {
                    case "IMAGE":
                        return new InteractionEventComponent(InteractionEventType.QUERY_IMAGE, context);
                    case "AUDIO":
                        return new InteractionEventComponent(InteractionEventType.QUERY_AUDIO, context);
                    case "MOTION":
                        return new InteractionEventComponent(InteractionEventType.QUERY_MOTION, context);
                    case "MODEL3D":
                        return new InteractionEventComponent(InteractionEventType.QUERY_MODEL3D, context);
                    case "TEXT":
                        context.set("q:value", t.data);
                        return new InteractionEventComponent(InteractionEventType.QUERY_FULLTEXT, context);
                    case "TAG":
                        context.set("q:value", t.data);
                        return new InteractionEventComponent(InteractionEventType.QUERY_TAG, context);
                }
            }),
            bufferCount(Number.MIN_SAFE_INTEGER)
        ).subscribe(c => this._eventBus.publish(new InteractionEvent(...c)))
    }

    /**
     * Clears all results and resets query terms.
     */
    public onClearAllClicked() {
        this._queryService.clear();
        this.containers.length = 0;
        this.addQueryTermContainer();
        this._eventBus.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.CLEAR)));
    }

    /**
     * Detects certain key combinations and takes appropriate action.
     *
     * @param {KeyboardEvent} event
     */
    @HostListener('window:keyup', ['$event'])
    public keyEvent(event: KeyboardEvent) {
        /** Detects a double-enter, which will trigger a new search. */
        if (event.keyCode === 13) {
            let timestamp = Date.now();
            if (timestamp - this._lastEnter < 1000) {
                this.onSearchClicked();
                this._lastEnter = 0;
            } else {
                this._lastEnter = timestamp;
            }
        }

        /** F1 will trigger a search. */
        if (event.keyCode == 112) {
            this.onSearchClicked();
        }

        /** F2 will reset the search. */
        if ( event.keyCode == 113) {
            this.onClearAllClicked();
        }
    }
}