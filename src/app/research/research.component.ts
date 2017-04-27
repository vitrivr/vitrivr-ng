import {Component} from '@angular/core';
import {QueryService} from "../core/queries/query.service";
import {QueryContainerInterface} from "../shared/model/queries/interfaces/query-container.interface";
import {QueryContainer} from "../shared/model/queries/query-container.model";
import {SimilarityQuery} from "../shared/model/messages/similarity-query.model";

@Component({
    moduleId: module.id,
    selector: 'research',
    templateUrl: 'research.component.html'
})

export class ResearchComponent  {
    /** QueryContainer's held by the current instance of ResearchComponent. */
    public readonly containers : QueryContainerInterface[] = [];

    /**
     * Constructor for ResearchComponent. Injects the globel QueryService instance.
     * @param _queryService QueryService instance (Singleton)
     */
    constructor(private _queryService: QueryService) { }

    /**
     * Adds a new QueryContainer to the list of QueryContainers.
     */
    public addQueryTermContainer() {
        this.containers.push(new QueryContainer())
    }

    /**
     * Triggers the similarity search by packing all configured QueryContainers into a single
     * SimilarityQuery message, and submitting that message to the QueryService.
     */
    public search() {
        let query = new SimilarityQuery(this.containers);
        this._queryService.findSimilar(query);
    }
}