import {AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {Config} from '../../shared/model/config/config.model';
import {first, map} from 'rxjs/operators';
import {DatabaseService} from '../../core/basics/database.service';
import Dexie from 'dexie';
import {DresTypeConverter} from '../../core/vbs/dres-type-converter.util';
import * as JSZip from 'jszip';
import {VbsSubmissionService} from '../../core/vbs/vbs-submission.service';
import {NotificationService} from '../../core/basics/notification.service';
import {AppConfig} from '../../app.config';
import {TemporalMode} from './temporal-mode-container.model';
import {from} from 'rxjs';
import {ClientRunInfo, ClientRunInfoService, ClientTaskInfo, UserDetails} from "../../../../openapi/dres";

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent implements AfterContentInit {
  _config: Config;

  /** Table for persisting result logs. */
  private _resultsLogTable: Dexie.Table<any, number>;

  /** Table for persisting submission log */
  private _submissionLogTable: Dexie.Table<any, number>;

  /** Table for persisting interaction logs. */
  private _interactionLogTable: Dexie.Table<DresTypeConverter, number>;

  _dresStatusBadgeValue: string;
  _status: UserDetails = null

  maxLength = 600;

  cineast = ((c: Config) => c.cineastEndpointWs);
  dresAddress = ((c: Config) => c._config.competition.host);
  hostThumbnails = ((c: Config) => c._config.resources.host_thumbnails);
  hostObjects = ((c: Config) => c._config.resources.host_objects);
  mode = ((c: Config) => c._config.query.temporal_mode);
  defaultContainerDist = ((c: Config) => c._config.query.default_temporal_distance);
  _activeRun: ClientRunInfo;
  _activeTask: ClientTaskInfo;

  /**
   * Constructor for PreferencesComponent
   */
  constructor(
      private _configService: AppConfig,
      private _db: DatabaseService,
      private _submissionService: VbsSubmissionService,
      private _notificationService: NotificationService,
      private _cdr: ChangeDetectorRef,
      private _runInfo: ClientRunInfoService
  ) {
    this._configService.configAsObservable.subscribe(c => {
      this._config = c
      this.maxLength = c._config.query.temporal_max_length
    })
    this._resultsLogTable = _db.db.table('log_results');
    this._interactionLogTable = _db.db.table('log_interaction');
    this._submissionLogTable = _db.db.table('log_submission');
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

  /**
   * Downloads the interaction logs as zipped JSON.
   */
  public onDownloadInteractionLog() {
    const data = [];
    from(this._interactionLogTable.orderBy('id').each((o, c) => {
      data.push(o)
    }))
      .pipe(
        first(),
        map(h => {
          const zip = new JSZip();
          const options = {base64: false, binary: false, date: new Date(), createFolders: false, dir: false};
          for (let i = 0; i < data.length; i++) {
            zip.file(`vitrivrng-interaction-log_${i}.json`, JSON.stringify(data[i], null, 2), options);
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

  /**
   * Downloads the results logs as zipped JSON.
   */
  public onDownloadResultsLog() {
    const data = [];
    from(this._resultsLogTable.orderBy('id').each((o, c) => {
      data.push(o)
    }))
      .pipe(
        first(),
        map(() => {
          const zip = new JSZip();
          const options = {base64: false, binary: false, date: new Date(), createFolders: false, dir: false};
          for (let i = 0; i < data.length; i++) {
            zip.file(`vitrivrng-results-log_${i}.json`, JSON.stringify(data[i], null, 2), options);
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

  public onDownloadSubmissionLog() {
    const data = [];
    from(this._submissionLogTable.orderBy('id').each((o, c) => {
      data.push(o)
    }))
      .pipe(
        first(),
        map(() => {
          const zip = new JSZip();
          const options = {base64: false, binary: false, date: new Date(), createFolders: false, dir: false};
          for (let i = 0; i < data.length; i++) {
            zip.file(`vitrivrng-submission-log_${i}.json`, JSON.stringify(data[i], null, 2), options);
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

  /**
   * Clears the interaction logs.
   */
  public onClearInteractionLog() {
    this._interactionLogTable.clear().then(() => console.log('Interaction logs cleared.'))
  }

  public onClearSubmissionLog() {
    this._submissionLogTable.clear().then(() => console.log('Submission logs cleared.'))
  }

  /**
   * Clears the results logs.
   */
  public onClearResultsLog() {
    this._resultsLogTable.clear().then(() => console.log('Results logs cleared.'))
  }

  ngAfterContentInit(): void {
    this._submissionService.statusObservable.subscribe({
      next: (status) => {
        if (status) {
          this._status = status
          this._cdr.markForCheck()
        }
      }
    })
    setInterval(() => {
      if (this._status) {
        this._runInfo.getApiV1ClientRunInfoList(this._status.sessionId).subscribe(list => {
          const l = list.runs.filter(info => info.status == 'ACTIVE');
          this._activeRun = l.length == 0 ? null : l[0]
          this._cdr.markForCheck()
          if (this._activeRun) {
            this._runInfo.getApiV1ClientRunInfoCurrenttaskWithRunid(this._activeRun.id, this._status.sessionId).subscribe(task => {
              this._activeTask = task
              this._cdr.markForCheck()
            })
          }
        })
      }
    }, 5 * 1000);
    this._notificationService.getDresStatusBadgeObservable().subscribe(el => this._dresStatusBadgeValue = el)
  }
}
