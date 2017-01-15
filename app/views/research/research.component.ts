import {Component} from '@angular/core';
import {MdDialog} from "@angular/material";
import {
    QueryContainerInterface,
    QueryContainer, ImageQueryTerm
} from "../../types/query.types";
import {QueryService} from "../../services/queries/queries.service";
import {MediaType} from "../../types/media.types";

@Component({
    selector: 'research',
    templateUrl: './app/views/research/research.component.html'
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
     *
     */
    addQueryTermContainer() {
        let term = new QueryContainer();
        term.imageQueryTerm = new ImageQueryTerm();
        this.containers.push(term)
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