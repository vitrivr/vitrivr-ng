import {Component, OnInit} from '@angular/core';
import {QueryChange, QueryService,} from './core/queries/query.service';
import {ConfigService} from './core/basics/config.service';
import {Config} from './shared/model/config/config.model';
import {Observable} from 'rxjs';
import {EventBusService} from './core/basics/event-bus.service';
import {filter, first, map} from 'rxjs/operators';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {HistoryComponent} from './results/history.component';
import {DistinctElementLookupService} from './core/lookup/distinct-element-lookup.service';
import {ValueType} from './query/containers/bool/bool-attribute';
import {IconService} from './query/containers/tag/tag-query-term.component';

@Component({

  selector: 'vitrivr',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    const config = this._configService.getValue();
    /* Initialize stuff which might take 1s+ on the Cineast-Side*/
    this.initLookup(config, this._distinctLookupService);
    this._configService.subscribe(config => this.initLookup(config, this._distinctLookupService));
    this.iconService.registerIcons();
  }

  /**
   * Default constructor. Subscribe for PING messages at the CineastWebSocketFactoryService.
   *
   * @param _queryService Reference to the singleton QueryService.
   * @param _configService Reference to the singleton ConfigService.
   * @param _eventBusService Reference to the singleton EventBusService.
   */
  constructor(_queryService: QueryService, private _configService: ConfigService, private _eventBusService: EventBusService, private _bottomSheet: MatBottomSheet, private _distinctLookupService: DistinctElementLookupService, private iconService: IconService) {
    this._loading = _queryService.observable.pipe(
      filter(msg => ['STARTED', 'ENDED', 'ERROR'].indexOf(msg) > -1),
      map((msg: QueryChange) => {
        return _queryService.running;
      })
    );
    this._config = _configService.asObservable();
  }

  public initLookup(config: Config, distinctLookupService: DistinctElementLookupService) {
    if (config._config.query.options.boolean) {
      config._config.query.boolean.forEach(v => {
        const type = <number><unknown>ValueType[v[1]];
        if (type == ValueType.DYNAMICOPTIONS.valueOf()) {
          const table: string = v[3];
          const column: string = v[4];
          /* Because i don't fully understand observables,
          we have to pretend to do something with the element so the actual retrieval is performed...
          */
          distinctLookupService.getDistinct(table, column).pipe(first()).forEach(el => el)
        }
      });
    }
  }

  /** Observable that returns the most recent application configuration. */
  private _config: Observable<Config>;

  /**
   * Getter for the observable config attribute.
   *
   * @return {Observable<Config>}
   */
  get config(): Observable<Config> {
    return this._config;
  }

  /** Observable that return the loading state of the QueryService. */
  private _loading: Observable<boolean>;

  /**
   * Getter for the observable loading attribute.
   *
   * @return {Observable<boolean>}
   */
  get loading(): Observable<boolean> {
    return this._loading;
  }

  /**
   * Displays the query history panel.
   */
  public showHistory() {
    this._bottomSheet.open(HistoryComponent, {
      ariaLabel: 'Show query history.'
    });
  }
}
