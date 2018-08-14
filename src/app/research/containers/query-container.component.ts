import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {QueryContainerInterface} from "../../shared/model/queries/interfaces/query-container.interface";
import {QueryTermType} from "../../shared/model/queries/interfaces/query-term-type.interface";
import {ConfigService} from "../../core/basics/config.service";
import {Config} from "../../shared/model/config/config.model";
import {Observable} from "rxjs";

@Component({
    selector: 'query-container',
    templateUrl: 'query-container.component.html'
})

export class QueryContainerComponent {
    /** The QueryContainer this QueryContainerComponent is associated to. */
    @Input() containerModel : QueryContainerInterface;

    /** A reference to the lists of QueryContainers (to enable removing the container). */
    @Input() inList : QueryContainerInterface[];

    /** A reference to the observable Config exposed by ConfigService. */
    private _config: Observable<Config>;

    /**
     * Constructor; injects ConfigService
     *
     * @param {ConfigService} _configService
     */
    constructor(_configService: ConfigService) {
        this._config = _configService.asObservable();
    }

    /**
     * Getter for config.
     *
     * @return {Config}
     */
    get config(): Observable<Config> {
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
