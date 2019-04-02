import {ApplicationRef, ChangeDetectorRef, Component, Injectable, Input, OnInit} from '@angular/core';
import {BoolQueryTerm} from '../../../shared/model/queries/bool-query-term.model';
import {MatOptionSelectionChange} from '@angular/material/typings/core';
import {BoolAttribute, BoolOperator, ValueType} from './bool-attribute';
import {BehaviorSubject, Observable} from 'rxjs/Rx';
import {QueryContainerInterface} from '../../../shared/model/queries/interfaces/query-container.interface';
import {BoolTermComponent} from './individual/bool-term.component';
import {QueryContainer} from '../../../shared/model/queries/query-container.model';

@Component({
    selector: 'app-qt-bool',
    templateUrl: 'bool-query-term.component.html',
    styleUrls: ['bool-query-term.component.css']
})
@Injectable()
export class BoolQueryTermComponent implements OnInit{

    // TODO add logic to store multiple queries with a combination. 1) the BoolQueryTerm should support it, 2) we need + / - logic
    /** This object holds all the query settings. */
    @Input()
    private boolTerm: BoolQueryTerm;
    // @Input()
    private possibleAttributes: BoolAttribute[] = [
        new BoolAttribute('heartrate', [BoolOperator.BIGGER, BoolOperator.SMALLER, BoolOperator.EQ], ValueType.NUMERIC),
        new BoolAttribute('description', [BoolOperator.LIKE], ValueType.TEXT),
        new BoolAttribute('weekday', [BoolOperator.EQ], ValueType.OPTIONS, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    ];

    public readonly containers: BoolTermComponent[] = [];

    public ngOnInit() {
        this.addBoolTermComponent();
    }
    public addBoolTermComponent() {
        this.containers.push(new BoolTermComponent())
    }

    /*
     * Setter for the data value of textTerm (for ngModel for input field).
     *
     * @param {string} value
     */
    set inputValue(value: string) {
        this.boolTerm.data = value;
    }

    /**
     * Getter for the data value of textTerm (for ngModel for input field).
     * @return {string}
     */
    get inputValue(): string {
        return this.boolTerm.data;
    }
}
