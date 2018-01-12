import {Component} from '@angular/core';
import {QueryChange, QueryService,} from "./core/queries/query.service";
import {MatSnackBar} from "@angular/material";
import {ConfigService} from "./core/basics/config.service";
import {Config} from "./shared/model/config/config.model";
import {Observable} from "rxjs/Observable";
@Component({
    styles : [`
        mat-sidenav {
            width: 300px;
        }
    `],
    selector: 'vitrivr',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    /** Observable that returns the most recent application configuration. */
    private _config: Observable<Config>;

    /** Observable that return the loading state of the QueryService. */
    private _loading: Observable<boolean>;

    /**
     * Default constructor. Subscribe for PING messages at the CineastWebSocketFactoryService.
     *
     * @param _queryService
     * @param _configService
     * @param _snackBar
     */
    constructor(_queryService : QueryService, _configService: ConfigService, private _snackBar: MatSnackBar) {
        this._loading = _queryService.observable.filter(msg => ["STARTED","ENDED","ERROR"].indexOf(msg) > -1).map((msg: QueryChange) => {
            switch (msg) {
                case "STARTED":
                    return true;
                case "ENDED":
                case "ERROR":
                    return false;
        }});
        this._config = _configService.asObservable();
    }

    /**
     *
     * @return {ConfigService}
     */
    get config(): Observable<Config> {
        return this._config;
    }

    /**
     *
     * @return {ConfigService}
     */
    get loading(): Observable<boolean> {
        return this._loading;
    }
}
