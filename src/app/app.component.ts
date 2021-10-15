import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {QueryService} from './core/queries/query.service';
import {Config} from './shared/model/config/config.model';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {HistoryComponent} from './results/history.component';
import {DistinctElementLookupService} from './core/lookup/distinct-element-lookup.service';
import {ValueType} from './query/containers/bool/bool-attribute';
import {SettingsComponent} from './settings/settings.component';
import {NotificationService} from './core/basics/notification.service';
import {AppConfig} from './app.config';

/** Enumeration of all possible views */
enum View { GALLERY, LIST, TEMPORAL}

@Component({
  selector: 'app-vitrivr',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  settingsbadge = '';
  @ViewChild('settingsComponent')
  private settingsComponent: SettingsComponent

  _config: Config;

  /** Observable that return the loading state of the QueryService. */
  private readonly _loading: Observable<boolean>;
  _loadBool = false

  /** Variable to safe currently selected view */
  public _active_view: View;

  competitionHost = ((c: Config) => c._config.competition.host);


  /**
   * Default constructor. Subscribe for PING messages at the CineastWebSocketFactoryService.
   */
  constructor(_queryService: QueryService,
              private _configService: AppConfig,
              private _bottomSheet: MatBottomSheet,
              private _distinctLookupService: DistinctElementLookupService,
              private _notificationService: NotificationService
  ) {
    _queryService.observable.subscribe(msg => {
      if (['STARTED', 'ENDED', 'ERROR'].indexOf(msg) > -1) {
        this._loadBool = _queryService.running
      }
    })
    this._loading = _queryService.observable.pipe(
      filter(msg => ['STARTED', 'ENDED', 'ERROR'].indexOf(msg) > -1),
      map(() => {
        return _queryService.running;
      })
    );
    _configService.configAsObservable.subscribe(c => this._config = c)
    this._active_view = View.GALLERY;
  }

  /**
   * Getter for the observable loading attribute.
   *
   * @return {Observable<boolean>}
   */
  get loading(): Observable<boolean> {
    return this._loading;
  }

  ngOnInit(): void {
    const config = this._configService.config;
    /* Initialize stuff which might take 1s+ on the Cineast-Side*/
    this.initLookup(config, this._distinctLookupService);
    this._configService.configAsObservable.subscribe(_config => this.initLookup(_config, this._distinctLookupService));
  }

  public initLookup(config: Config, distinctLookupService: DistinctElementLookupService) {
    if (config._config.query.options.boolean) {
      config._config.query.boolean.forEach(v => {
        const type = <number><unknown>ValueType[v[1]];
        if (type === ValueType.DYNAMICOPTIONS.valueOf()) {
          const table: string = v[3];
          const column: string = v[4];
          distinctLookupService.getDistinct(table, column).subscribe()
        }
      });
    }
  }

  /**
   * Displays the query history panel.
   */
  public showHistory() {
    this._bottomSheet.open(HistoryComponent, {
      ariaLabel: 'Show query history.'
    });
  }

  ngAfterViewInit(): void {
    this._notificationService.getDresStatusBadgeObservable().subscribe(el => this.settingsbadge = el)
  }

  /** Change the active view to the given one */
  public setActiveView(view: View) {
    this._active_view = view;
  }

  /** Check if a given view is active */
  public isView(view: View) {
    return this._active_view === view;
  }
}
