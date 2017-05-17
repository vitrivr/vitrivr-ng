import {Component} from '@angular/core';
import {QueryService, QueryChange} from "./core/queries/query.service";

@Component({
    styles : [`
        md-sidenav {
            width: 300px;
        }
    `],
    selector: 'vitrivr',
    templateUrl: 'app.component.html'
})


export class AppComponent  {
    /* Indicator whether the progress bar should be visible. */
    public loading : boolean = false;

    /**
     * Default constructor. Subscribe for PING messages at the CineastAPI.
     *
     * @param _queryService
     */
    constructor(private _queryService : QueryService) {
        _queryService.observable
            .filter(msg => ["STARTED", "ENDED"].indexOf(msg) > -1)
            .subscribe((msg) => this.onQueryStateChange(msg));

    }

    /**
     *
     * @param msg
     */
    private onQueryStateChange(msg : QueryChange) {
        if (msg == "STARTED") {
            this.loading = true;
        } else if (msg == "ENDED") {
            this.loading = false;
        }
    }
}
