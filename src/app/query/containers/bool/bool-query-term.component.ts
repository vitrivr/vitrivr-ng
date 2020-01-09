import {Component, Injectable, Input, OnInit} from '@angular/core';
import {BoolQueryTerm} from '../../../shared/model/queries/bool-query-term.model';
import {BoolAttribute, ValueType} from './bool-attribute';
import {BehaviorSubject} from 'rxjs/Rx';
import {BoolTermComponent} from './individual/bool-term.component';
import {ConfigService} from '../../../core/basics/config.service';

@Component({
    selector: 'app-qt-bool',
    templateUrl: 'bool-query-term.component.html',
    styleUrls: ['bool-query-term.component.css']
})
@Injectable()
export class BoolQueryTermComponent implements OnInit {

    // TODO add logic to store multiple queries with a combination.
    //  1) the BoolQueryTerm should support it,
    //  2) we need + / - logic
    /** This object holds all the query settings. */
    @Input()
    protected boolTerm: BoolQueryTerm;
    protected possibleAttributes: BehaviorSubject<BoolAttribute[]> = new BehaviorSubject(
        [new BoolAttribute('debug-attribute', 'features.debug', ValueType.TEXT)]
    );
    public readonly containers: BoolTermComponent[] = [];

    constructor(_configService: ConfigService) {
        _configService.subscribe(c => {
            const next = [];
            c.get<[string, string, string][]>('query.boolean').forEach(v => {
                next.push(new BoolAttribute(v[0], v[2], ValueType[v[1]]))
            });
            this.possibleAttributes.next(next);
        })
    }

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
