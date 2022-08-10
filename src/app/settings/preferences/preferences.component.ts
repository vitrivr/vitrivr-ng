import {AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {Config} from '../../shared/model/config/config.model';
import {first, map} from 'rxjs/operators';
import {DatabaseService} from '../../core/basics/database.service';
import Dexie from 'dexie';
import * as JSZip from 'jszip';
import {VbsSubmissionService} from '../../core/competition/vbs-submission.service';
import {NotificationService} from '../../core/basics/notification.service';
import {AppConfig} from '../../app.config';
import {TemporalMode} from './temporal-mode-container.model';
import {from} from 'rxjs';
import {ClientRunInfo, ClientRunInfoService, ClientTaskInfo, QueryEventLog, QueryResultLog, UserDetails} from '../../../../openapi/dres';
import {ResultLogItem} from '../../core/competition/logging/result-log-item';
import {DresService} from '../../core/basics/dres.service';
import {QueryLogItem} from '../../core/competition/logging/query-log-item';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent implements AfterContentInit {
  _config: Config;

  /** Table for persisting our result logs */
  private _resultsLogTable: Dexie.Table<QueryResultLog, number>;

  private _queryLogTable: Dexie.Table<QueryLogItem, number>;

  /** Table for persisting DRES result logs */
  private _dresResultsLogTable: Dexie.Table<ResultLogItem, number>;

  /** Table for persisting DRES submission logs */
  private _dresSubmissionLogTable: Dexie.Table<any, number>;

  /** Table for persisting DRES interaction logs. */
  private _dresInteractionLogTable: Dexie.Table<QueryEventLog, number>;

  maxLength = 600;

  cineast = ((c: Config) => c.cineastEndpointWs);
  hostThumbnails = ((c: Config) => c._config.resources.host_thumbnails);
  hostObjects = ((c: Config) => c._config.resources.host_objects);
  mode = ((c: Config) => c._config.query.temporal_mode);
  defaultContainerDist = ((c: Config) => c._config.query.default_temporal_distance);

  /**
   * Constructor for PreferencesComponent
   */
  constructor(
    private _configService: AppConfig,
    private _db: DatabaseService,
    private _submissionService: VbsSubmissionService,
    private _cdr: ChangeDetectorRef,
  ) {
  }

  public onModeChanged(mode: TemporalMode) {
    this._configService.config._config.query.temporal_mode = mode
    this._configService.publishChanges()
  }

  public onMaxLengthSaveClicked() {
    this._configService.config._config.query.temporal_max_length = this.maxLength
    this._configService.publishChanges()
  }

  /**
   * Resets the config and reloads it.
   */
  public onResetButtonClicked() {
    this._configService.load();
  }

  public onDownloadResultsLog() {
    this.onLogDownload('results', this._resultsLogTable)
  }

  public onDownloadQueryLog() {
    this.onLogDownload('queries', this._queryLogTable)
  }

  public onDownloadDRESInteractionLog() {
    this.onLogDownload('dres-interaction', this._dresInteractionLogTable)
  }

  public onDownloadDRESResultsLog() {
    this.onLogDownload('dres-results', this._dresResultsLogTable)
  }

  public onDownloadDRESSubmissionLog() {
    this.onLogDownload('dres-submission', this._dresSubmissionLogTable)
  }

  private onLogDownload(description: string, table: Dexie.Table<any, number>) {
    const data = [];
    from(table.orderBy('id').each((o, c) => {
      data.push(o)
    }))
      .pipe(
        first(),
        map(() => {
          const zip = new JSZip();
          const options = {base64: false, binary: false, date: new Date(), createFolders: false, dir: false};
          for (let i = 0; i < data.length; i++) {
            zip.file(`vitrivrng-${description}-log_${i}.json`, JSON.stringify(data[i], null, 2), options);
          }
          return zip
        })
      )
      .subscribe(zip => {
        zip.generateAsync({type: 'blob', compression: 'DEFLATE'}).then(
          (result) => {
            window.open(window.URL.createObjectURL(result));
          },
          (error) => {
            console.log(error);
          }
        )
      });
  }

  public onClearDRESInteractionLog() {
    this._dresInteractionLogTable.clear().then(() => console.log('DRES Interaction logs cleared.'))
  }

  public onClearDRESSubmissionLog() {
    this._dresSubmissionLogTable.clear().then(() => console.log('DRES Submission logs cleared.'))
  }

  public onClearDRESResultsLog() {
    this._dresResultsLogTable.clear().then(() => console.log('DRES Results logs cleared.'))
  }

  public onClearResultsLog() {
    this._resultsLogTable.clear().then(() => console.log('Results logs cleared.'))
  }

  public onClearQueryLog() {
    this._queryLogTable.clear().then(() => console.log('Query logs cleared.'))
  }


  ngAfterContentInit(): void {
    this._configService.configAsObservable.subscribe(c => {
      this._config = c
      this.maxLength = c._config.query.temporal_max_length
    })
    this._resultsLogTable = this._db.db.table('log_results');
    this._queryLogTable = this._db.db.table('log_queries');
    this._dresResultsLogTable = this._db.db.table('log_results_dres');
    this._dresInteractionLogTable = this._db.db.table('log_interaction_dres');
    this._dresSubmissionLogTable = this._db.db.table('log_submission_dres');
  }
}
