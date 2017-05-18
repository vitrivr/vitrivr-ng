import {Component, OnInit} from '@angular/core';
import {QueryService} from "../core/queries/query.service";
import {QueryContainerInterface} from "../shared/model/queries/interfaces/query-container.interface";
import {QueryContainer} from "../shared/model/queries/query-container.model";
import {SimilarityQuery} from "../shared/model/messages/similarity-query.model";

@Component({
    moduleId: module.id,
    selector: 'research',
    templateUrl: 'research.component.html'
})
export class ResearchComponent implements OnInit {
    /** QueryContainer's held by the current instance of ResearchComponent. */
    public readonly containers : QueryContainerInterface[] = [];

    /**
     * Constructor for ResearchComponent. Injects the globel QueryService instance.
     * @param _queryService QueryService instance (Singleton)
     */
    constructor(private _queryService: QueryService) { }

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
        let query = new SimilarityQuery(this.containers);
        this._queryService.findSimilar(query);
    }

    /**
     * Clears all results and resets query terms.
     */
    public onClearAllClicked() {
        this._queryService.clear();
        this.containers.length = 0;
        this.addQueryTermContainer();
    }
}