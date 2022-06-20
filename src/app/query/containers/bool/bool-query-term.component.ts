import {Component, Input, OnInit} from '@angular/core';
import {BoolQueryTerm} from '../../../shared/model/queries/bool-query-term.model';
import {BoolAttribute, InputType} from './bool-attribute';
import {BehaviorSubject} from 'rxjs';
import {BoolTerm} from './individual/bool-term';
import {DistinctElementLookupService} from '../../../core/lookup/distinct-element-lookup.service';
import {first, map} from 'rxjs/operators';
import {AppConfig} from '../../../app.config';
import {MiscService} from '../../../../../openapi/cineast';
import {BooleanQueryOption} from '../../../shared/model/config/boolean-query-option.model';

@Component({
  selector: 'app-qt-bool',
  templateUrl: 'bool-query-term.component.html',
  styleUrls: ['bool-query-term.component.css']
})
export class BoolQueryTermComponent implements OnInit {

  // TODO add logic to store multiple queries with a combination.
  //  1) the BoolQueryTerm should support it,
  //  2) we need + / - logic
  /** This object holds all the query settings. */
  @Input()
  boolTerm: BoolQueryTerm;

  possibleAttributes: BehaviorSubject<BoolAttribute[]> = new BehaviorSubject(null);

  public ngOnInit() {
    /* only add an empty term if there are none currently present*/
    if (this.boolTerm.terms.length !== 0) {
      return;
    }
    this.addBoolTermComponent();
  }

  constructor(
    _configService: AppConfig,
    _booleanService: MiscService,
    _distinctLookupService: DistinctElementLookupService) {
    _configService.configAsObservable.subscribe(c => {
      const next = [];
      c._config.query.boolean.forEach(v => {
        const option = v as BooleanQueryOption
        if(BooleanQueryOption.getInputTypeValue(option.input)== InputType.DYNAMICOPTIONS){
          _booleanService.findDistinctElementsByColumn()
          _distinctLookupService.getDistinct(option.table, option.col).pipe(first(), map(list => list.sort())).forEach(el => {
            next.push(new BoolAttribute(option.display, option.table+'.'+option.col, BooleanQueryOption.getInputTypeValue(option.input), option.operators, el, option.range, option.type))
            this.possibleAttributes.next(next);
          });
          return
        }
        next.push(new BoolAttribute(option.display, option.table+'.'+option.col, BooleanQueryOption.getInputTypeValue(option.input), option.operators, option.options, option.range, option.type))
      });
      this.possibleAttributes.next(next);
    })
  }

  public addBoolTermComponent() {
    this.boolTerm.terms.push(new BoolTerm(this.possibleAttributes.getValue()[0].featureName, this.possibleAttributes.getValue()[0].operators[0], null));
  }
}
