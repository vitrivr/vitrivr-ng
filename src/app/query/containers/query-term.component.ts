import {Component, Input} from '@angular/core';
import {QueryTermInterface} from '../../shared/model/queries/interfaces/query-term.interface';
import {ConfigService} from '../../core/basics/config.service';

@Component({
    selector: 'app-query-component',
    templateUrl: 'query-term.component.html',
    styleUrls: []
})

export class QueryTermComponent {

    @Input() queryTerm: QueryTermInterface;

    @Input() qtList: QueryTermInterface[];

    constructor(private readonly _config: ConfigService) {
    }

    onPushUpClicked() {
        const index = this.qtList.indexOf(this.queryTerm);
        if (index > 0) {
            const qt = this.qtList[index - 1];
            this.qtList[index - 1] = this.queryTerm;
            this.qtList[index] = qt;
        } else {
            console.warn(`element ${this.queryTerm} is first in the list and can therefore not be pushed up`)
        }
    }

    onPushDownClicked() {
        const index = this.qtList.indexOf(this.queryTerm);
        if (index < this.qtList.length - 1) {
            const qt = this.qtList[index + 1];
            this.qtList[index + 1] = this.queryTerm;
            this.qtList[index] = qt;
        } else {
            console.warn(`element ${this.queryTerm} is last in the list and can therefore not be pushed down`)
        }
    }

    notLast() {
        return this.qtList.indexOf(this.queryTerm) < this.qtList.length - 1;
    }

    notFirst() {
        return this.qtList.indexOf(this.queryTerm) > 0;
    }

    stagedQEnabled() {
        return this._config.getValue().get<Boolean>('query.staged');
    }
}
