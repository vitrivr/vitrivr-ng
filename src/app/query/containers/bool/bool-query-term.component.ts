import {Component, ComponentFactoryResolver, Injectable, Input, OnInit, OnDestroy} from '@angular/core';
import {BoolQueryTerm} from '../../../shared/model/queries/bool-query-term.model';
import {BoolAttribute, BoolOperator, ValueType} from './bool-attribute';
import {BehaviorSubject} from 'rxjs';
import {BoolTerm} from './individual/bool-term';
import {DistinctElementLookupService} from '../../../core/lookup/distinct-element-lookup.service';
import {first, map} from 'rxjs/operators';
import {AppConfig} from '../../../app.config';
import {MiscService} from '../../../../../openapi/cineast';
import {QueryService} from '../../../core/queries/query.service';
import {BooleanService} from '../../../core/queries/boolean.service';
import {BooleanLookupQuery} from '../../../shared/model/messages/queries/boolean-lookupquery.model';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-qt-bool',
  templateUrl: 'bool-query-term.component.html',
  styleUrls: ['bool-query-term.component.css']
})
@Injectable()
export class BoolQueryTermComponent implements OnInit, OnDestroy {

  // TODO add logic to store multiple queries with a combination.
  //  1) the BoolQueryTerm should support it,
  //  2) we need + / - logic
  /** This object holds all the query settings. */
  @Input()
  boolTerm: BoolQueryTerm;

  possibleAttributes: BehaviorSubject<BoolAttribute[]> = new BehaviorSubject(
    [new BoolAttribute('debug-attribute', 'features.debug', ValueType.TEXT)]
  );

  boolAsFilter: boolean;

  boolLookupQueries: BooleanLookupQuery[] = [];

  public ngOnInit() {
    /* only add an empty term if there are none currently present*/
    if (this.boolTerm.terms.length !== 0) {
      return;
    }
    this.addBoolTermComponent();
  }

    /** Resets the Booleanfilter to false */
  public ngOnDestroy(): void {
      this._queryService.setBooleanAsFilter(false);
  }
  constructor(private _queryService: QueryService,
              private _boolService: BooleanService,
    _configService: AppConfig,
    private _resolver: ComponentFactoryResolver,
    _booleanService: MiscService,
    _distinctLookupService: DistinctElementLookupService) {
    _configService.configAsObservable.subscribe(c => {
      const next = [];
      c._config.query.boolean.forEach(v => {
        const type = <number><unknown>ValueType[v[1]];
        const displayName = v[0];
        const feature: string = v[2];
        switch (type) {
          case ValueType.DATE.valueOf():
          case ValueType.NUMERIC.valueOf():
          case ValueType.TEXT.valueOf():
            next.push(new BoolAttribute(displayName, feature, ValueType[<string>v[1]]));
            break;
          case ValueType.OPTIONS.valueOf():
            next.push(new BoolAttribute(displayName, feature, ValueType[<string>v[1]], null, v.slice(3, v.length), null));
            break;
          case ValueType.RANGE.valueOf():
              const tableR: string = v[5];
              const columnR: string = v[6];
              _distinctLookupService.getAllElements(tableR, columnR).pipe(first()).subscribe( value => {
                      next.push(new BoolAttribute(displayName, feature, ValueType[<string>v[1]], null, null, [v[3], v[4]], value));
                      this.possibleAttributes.next(next);
              });
            break;
          case ValueType.DYNAMICOPTIONS.valueOf():
              const table: string = v[3];
              const column: string = v[4];
              _distinctLookupService.getAllElements(table, column).pipe(first()).subscribe( value => {
                  _distinctLookupService.getDistinct(table, column).pipe(first(), map(list => list.sort())).forEach(el => {
                      next.push(new BoolAttribute(displayName, feature, ValueType[<string>v[1]], null, el, null, value));
                      this.possibleAttributes.next(next);
                });
            });
            break;
          default:
            console.error(`no type ${type} found, ${ValueType.TEXT.valueOf()}`)
        }
      });
      this.possibleAttributes.next(next);
    });
      this.boolAsFilter = this._queryService._booleanasfilter.getValue();
      this._boolService.findBool([new BooleanLookupQuery('test_table', 'id', [], 'EQ', 0)] , 'B_ALL', 0);
  }

  public addBoolTermComponent() {
    this.boolTerm.terms.push(new BoolTerm(this.possibleAttributes.getValue()[0].featureName, this.possibleAttributes.getValue()[0].operators[0], null, true));
  }
  public changeBoolToFilter() {
    this._queryService.setBooleanAsFilter(this.boolAsFilter);
  }
}

