import {Component, OnDestroy, OnInit} from '@angular/core';
import {QueryService, QueryChange} from "./core/queries/query.service";
import {MdSnackBar} from "@angular/material";
import {ConfigService} from "./core/basics/config.service";
import {Config} from "./core/basics/config.model";
import {Subscription} from "rxjs/Subscription";
@Component({
    styles : [`
        md-sidenav {
            width: 300px;
        }
    `],
    selector: 'vitrivr',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

    /* Indicator whether the progress bar should be visible. */
    public loading : boolean = false;

    /* Current instance of application configuration. */
    private _config: Config;

    /* Subscription to QueryService for further reference. */
    private _queryServiceSubscription: Subscription;

    /* Subscription to ConfigService for further reference. */
    private _configServiceSubscription: Subscription;

    /**
     * Default constructor. Subscribe for PING messages at the CineastAPI.
     *
     * @param _queryService
     * @param _configService
     * @param _snackBar
     */
    constructor(private _queryService : QueryService, private _configService: ConfigService, private _snackBar: MdSnackBar) {}

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit(): void {
        this._queryServiceSubscription = this._queryService.observable.filter(msg => ["STARTED", "ERROR", "ENDED"].indexOf(msg) > -1).subscribe((msg) => {
            this.onQueryStateChange(msg)
        });
        this._configServiceSubscription = this._configService.observable.subscribe((config) => {
            this._config = config;
        })
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the QueryService subscription.
     */
    public ngOnDestroy() {
        this._queryServiceSubscription.unsubscribe();
        this._configServiceSubscription.unsubscribe();
        this._queryServiceSubscription = null;
        this._configServiceSubscription = null;
    }

    /**
     *
     * @return {ConfigService}
     */
    get config(): Config {
        return this._config;
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
