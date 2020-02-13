import {Component, Injectable, Input, OnInit} from '@angular/core';
import {BoolQueryTerm} from '../../../shared/model/queries/bool-query-term.model';
import {BoolAttribute, ValueType} from './bool-attribute';
import {BehaviorSubject} from 'rxjs/Rx';
import {BoolTermComponent} from './individual/bool-term.component';
import {ConfigService} from '../../../core/basics/config.service';
import {AbstractQueryTermComponent} from '../abstract-query-term.component';

@Component({
  selector: 'app-qt-bool',
  templateUrl: 'bool-query-term.component.html',
  styleUrls: ['bool-query-term.component.css']
})
@Injectable()
export class BoolQueryTermComponent extends AbstractQueryTermComponent implements OnInit {

  // TODO add logic to store multiple queries with a combination.
  //  1) the BoolQueryTerm should support it,
  public readonly containers: BoolTermComponent[] = [];
  //  2) we need + / - logic
  /** This object holds all the query settings. */
  @Input()
  protected boolTerm: BoolQueryTerm;
  protected possibleAttributes: BehaviorSubject<BoolAttribute[]> = new BehaviorSubject(
    [new BoolAttribute('debug-attribute', 'features.debug', ValueType.TEXT)]
  );

  constructor(_configService: ConfigService) {
    super();
    _configService.subscribe(c => {
      const next = [];
      c.get<[string, string, string][]>('query.boolean').forEach(v => {
        next.push(new BoolAttribute(v[0], v[2], ValueType[v[1]]))
      });
      this.possibleAttributes.next(next);
    })
  }

  /**
   * Getter for the data value of textTerm (for ngModel for input field).
   * @return {string}
   */
  get inputValue(): string {
    return this.boolTerm.data;
  }

  /*
   * Setter for the data value of textTerm (for ngModel for input field).
   *
   * @param {string} value
   */
  set inputValue(value: string) {
    this.boolTerm.data = value;
  }

  public ngOnInit() {
    this.addBoolTermComponent();
  }

  public addBoolTermComponent() {
    this.containers.push(new BoolTermComponent())
  }
}
