import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {QueryContainerInterface} from "../../shared/model/queries/interfaces/query-container.interface";
import {QueryTermType} from "../../shared/model/queries/interfaces/query-term-type.interface";
import {ConfigService} from "../../core/basics/config.service";
import {Config} from "../../core/basics/config.model";

@Component({
    selector: 'query-container',
    templateUrl: 'query-container.component.html'
})

export class QueryContainerComponent implements OnInit, OnDestroy {
    /* The QueryContainer this QueryContainerComponent is associated to. */
    @Input() containerModel : QueryContainerInterface;

    /* A reference to the lists of QueryContainers (to enable remvoing the container). */
    @Input() inList : QueryContainerInterface[];

    /** Local instance of Config object. */
    private _config: Config;

    /** Reference to Subscription to ConfigService. */
    private _configServiceSubscription;

    /**
     * Constructor; injects ConfigService
     *
     * @param {ConfigService} _configService
     */
    constructor(private _configService: ConfigService) {}

    /**
     * Lifecycle Callback (OnInit): Subscribes to ConfigService.
     */
    public ngOnInit(): void {
        this._configServiceSubscription = this._configService.observable.subscribe((config) => {
            this._config = config;
        });
    }

    /**
     * Lifecycle Callback (OnDestroy): Unsubscribes from subscription to ConfigService.
     */
    public ngOnDestroy(): void {
       this._configServiceSubscription.unsubscribe();
    }

    /**
     * Getter for config.
     *
     * @return {Config}
     */
    get config(): Config {
        return this._config;
    }

    /**
     * Triggered, when a user clicks the remove-button (top-right corner). Removes
     * the QueryContainerComponent from the list.
     */
    public onRemoveButtonClicked() {
        let index = this.inList.indexOf(this.containerModel);
        if (index > -1) {
            this.inList.splice(index, 1)
        }
    }

    /**
     *
     * @param type
     */
    public onToggleButtonClicked(type: QueryTermType) {
         if (this.containerModel.hasTerm(type)) {
             this.containerModel.removeTerm(type);
         } else {
             this.containerModel.addTerm(type);
         }
    }
}
