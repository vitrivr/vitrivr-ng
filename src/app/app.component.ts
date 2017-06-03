import {Component} from '@angular/core';
import {QueryService, QueryChange} from "./core/queries/query.service";
import {MdSnackBar} from "@angular/material";
import {ConfigService} from "./core/basics/config.service";

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
     * @param _snackBar
     */
    constructor(private _queryService : QueryService, private _snackBar: MdSnackBar) {
        _queryService.observable
            .filter(msg => ["STARTED", "ERROR", "ENDED"].indexOf(msg) > -1)
            .subscribe((msg) => this.onQueryStateChange(msg));

    }

    /**
     * Called, whenever QueryService reports a state change the AppComponent
     * has subscribed to.
     *
     * @param msg
     */
    private onQueryStateChange(msg : QueryChange) {
        switch (msg) {
            case "STARTED":
                this.loading = true;
                break;
            case "ENDED":
                this.loading = false;
                break;
            case "ERROR":
                this.loading = false;
                this._snackBar.open("Cineast API returned an error - query aborted!" , null, {duration: ConfigService.SNACKBAR_DURATION});
                break;
        }
    }
}
