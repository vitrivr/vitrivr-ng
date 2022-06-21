import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {QueryService} from './core/queries/query.service';
import {Config} from './shared/model/config/config.model';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {HistoryComponent} from './results/history.component';
import {DistinctElementLookupService} from './core/lookup/distinct-element-lookup.service';
import {InputType} from './query/containers/bool/bool-attribute';
import {NotificationService} from './core/basics/notification.service';
import {AppConfig} from './app.config';
import {DresService} from "./core/basics/dres.service";

/** Enumeration of all possible views */
enum View { GALLERY, LIST, TEMPORAL}

@Component({
  selector: 'app-vitrivr',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, AfterViewInit {

  settingsBadge = ''
  config: Config
  loading = false
  textualSubmissionOpen = false
  activeView: View = View.GALLERY
  competitionHost = ((c: Config) => c._config.competition.host)
  textualInput = ((c: Config) => c._config.competition.textualInput)


  /**
   * Default constructor. Subscribe for PING messages at the CineastWebSocketFactoryService.
   */
  constructor(private _queryService: QueryService,
              private _configService: AppConfig,
              private _bottomSheet: MatBottomSheet,
              private _distinctLookupService: DistinctElementLookupService,
              private _notificationService: NotificationService,
              private _cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    /* Initialize stuff which might take 1s+ on the Cineast-Side*/
    this._configService.configAsObservable.subscribe(c => {
      this.config = c
      this.initLookup(c, this._distinctLookupService)
    })
    this._queryService.observable.subscribe(msg => {
      if (['STARTED', 'ENDED', 'ERROR'].indexOf(msg) > -1) {
        this.loading = this._queryService.running
      }
    })

  }

  public initLookup(config: Config, distinctLookupService: DistinctElementLookupService) {
    if (config._config.query.options.boolean) {
      config._config.query.boolean.forEach(v => {
        const type = <number><unknown>InputType[v[1]];
        if (type === InputType.DYNAMICOPTIONS.valueOf()) {
          distinctLookupService.getDistinct(v.table, v.col).subscribe()
        }
      })
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
    this._notificationService.getDresStatusBadgeObservable().subscribe(el => this.settingsBadge = el)
  }

  /** Change the active view to the given one */
  public setActiveView(view: View) {
    this.activeView = view;
  }
}
