import {Component, ComponentFactoryResolver, Injectable, Input, OnInit} from '@angular/core';
import {BoolQueryTerm} from '../../../shared/model/queries/bool-query-term.model';
import {BoolAttribute, ValueType} from './bool-attribute';
import {BehaviorSubject} from 'rxjs';
import {BoolTerm} from './individual/bool-term';
import {DistinctElementLookupService} from '../../../core/lookup/distinct-element-lookup.service';
import {first, map} from 'rxjs/operators';
import {AppConfig} from '../../../app.config';
import {MiscService} from '../../../../../openapi/cineast';
import {QueryService} from '../../../core/queries/query.service';
import {BooleanService} from '../../../core/queries/boolean.service';
import {BooleanLookupQuery} from '../../../shared/model/messages/queries/boolean-lookupquery.model';
import { Options } from '@angular-slider/ngx-slider';

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
  boolTerm: BoolQueryTerm;

  possibleAttributes: BehaviorSubject<BoolAttribute[]> = new BehaviorSubject(
    [new BoolAttribute('debug-attribute', 'features.debug', ValueType.TEXT)]
  );
  /** If set to true Boolean Query is applied as filter */
  boolAsFilter: boolean;
  /** Contains the Queries that are used to get the number of results to be returned for each Bool Term*/
  boolLookupQueries: BooleanLookupQuery[] = [];

  /** If extendedModel is true, then to container weight of the BoolContainer can be set */
  options: Options = {
        floor: 0.1,
        ceil: 1,
      step: 0.1
    };
  /** If set to true Term Preferences to the single Terms are shown */
  extendedModel: boolean;

  public ngOnInit() {
    /* only add an empty term if there are none currently present*/
    if (this.boolTerm.terms.length !== 0) {
      return;
    }
    this.addBoolTermComponent();
  }
  constructor(public _queryService: QueryService,
              public _boolService: BooleanService,
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
              _distinctLookupService.getAllElements(feature.split('.')[0], feature.split('.')[1]).pipe(first()).subscribe( value => {
                  const unique = [...new Set(value)];
                  const attribute = new BoolAttribute(displayName, feature, ValueType[<string>v[1]], null, null, null, unique);
                  next.push(attribute);
                  this.possibleAttributes.next(next);
              });
            // next.push(new BoolAttribute(displayName, feature, ValueType[<string>v[1]]));
            break;
          case ValueType.OPTIONS.valueOf():
            next.push(new BoolAttribute(displayName, feature, ValueType[<string>v[1]], null, v.slice(3, v.length), null));
            break;
          case ValueType.RANGE.valueOf():
              const tableR: string = v[5];
              const columnR: string = v[6];
              _distinctLookupService.getAllElements(tableR, columnR).pipe(first()).subscribe( value => {
                  const attribute = new BoolAttribute(displayName, feature, ValueType[<string>v[1]], null, null, [v[3], v[4]], value);
                  attribute.createData();
                      next.push(attribute);
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
      this._boolService.findBool([new BooleanLookupQuery('cineast_segment', 'segmentid', [], 'EQ', 0)] , 'B_ALL', 0);
      this._boolService.newModelObs.subscribe(next => this.extendedModel = next);
      this._queryService._booleanasfilterObsv.subscribe(next => this.boolAsFilter = next);
  }

  public addBoolTermComponent() {
    this.boolTerm.terms.push(new BoolTerm(this.possibleAttributes.getValue()[0].featureName, this.possibleAttributes.getValue()[0].operators[0], null, true));
  }
  public changeBoolToFilter(value: boolean) {
    this._queryService.setBooleanAsFilter(value);
  }


  get weightValue(): number {
      return this.boolTerm.weight;
  }

  set weightValue(value: number) {
      this.boolTerm.setWeight(value);
  }

  public modelChange(value: boolean) {
      this._boolService.setModel(value);
  }
}

