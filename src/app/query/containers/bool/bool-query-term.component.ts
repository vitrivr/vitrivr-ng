import {Component, ComponentFactoryResolver, Injectable, Input, OnInit} from '@angular/core';
import {BoolQueryTerm} from '../../../shared/model/queries/bool-query-term.model';
import {BoolAttribute, ValueType} from './bool-attribute';
import {BehaviorSubject} from 'rxjs/Rx';
import {ConfigService} from '../../../core/basics/config.service';
import {BoolTerm} from './individual/bool-term';

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

  public ngOnInit() {
    /* only add an empty term if there are none currently present*/
    if (this.boolTerm.terms.length != 0) {
      return;
    }
    this.addBoolTermComponent();
  }

  constructor(_configService: ConfigService, private _resolver: ComponentFactoryResolver) {
    _configService.subscribe(c => {
      const next = [];
      c.get<[string, string, string][]>('query.boolean').forEach(v => {
        next.push(new BoolAttribute(v[0], v[2], ValueType[v[1]]))
      });
      this.possibleAttributes.next(next);
    })
  }

  public addBoolTermComponent() {
    this.boolTerm.terms.push(new BoolTerm(this.possibleAttributes.getValue()[0].featureName, this.possibleAttributes.getValue()[0].operators[0], null));
  }
}
