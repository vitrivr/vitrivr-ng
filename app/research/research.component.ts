import {Component} from '@angular/core';
import {MdDialog} from "@angular/material";
import {QueryService} from "../core/queries/queries.service";

import {MediaType} from "../shared/model/media/media-object.model";
import {QueryContainerInterface} from "../shared/model/queries/interfaces/query-container.interface";
import {QueryContainer} from "../shared/model/queries/query-container.model";
import {ImageQueryTerm} from "../shared/model/queries/image-query-term.model";

@Component({
    moduleId: module.id,
    selector: 'research',
    templateUrl: 'research.component.html'
})

export class ResearchComponent  {
    private activeTypes : MediaType[] = [
       "AUDIO",
        "VIDEO",
        "IMAGE"
    ];

    public containers : QueryContainerInterface[] = [];

    constructor(private _queryTermService: QueryService, private _dialog: MdDialog) { }

    /**
     * Adds a new QueryContainer to the list.
     */
    private addQueryTermContainer() {
        this.containers.push(new QueryContainer())
    }

    /**
     *
     */
    search() {
        let query = this._queryTermService.buildQuery(this.activeTypes, this.containers);
        this._queryTermService.query(query);
    }

    /**
     *
     * @param type
     * @returns {boolean}
     */
    isActive(type : MediaType) : boolean {
        return this.activeTypes.indexOf(type) > -1
    }

    /**
     *
     * @param type
     */
    toggleActive(type: MediaType) {
        let idx = this.activeTypes.indexOf(type);
        if (idx == -1) {
            this.activeTypes.push(type);
        } else {
            this.activeTypes.slice(idx, 1);
        }
    }
}