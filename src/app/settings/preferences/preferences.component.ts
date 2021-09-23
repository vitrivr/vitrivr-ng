import {AfterContentInit, Component} from '@angular/core';
import {Config} from '../../shared/model/config/config.model';
import {first, map} from 'rxjs/operators';
import {DatabaseService} from '../../core/basics/database.service';
import Dexie from 'dexie';
import {DresTypeConverter} from '../../core/vbs/dres-type-converter.util';
import {fromPromise} from 'rxjs/internal-compatibility';
import * as JSZip from 'jszip';
import {VbsSubmissionService} from '../../core/vbs/vbs-submission.service';
import {NotificationService} from '../../core/basics/notification.service';
import {AppConfig} from '../../app.config';
import {TemporalMode} from './temporal-mode-container.model';

@Component({

  selector: 'app-preferences',
  templateUrl: './preferences.component.html'
})
export class PreferencesComponent implements AfterContentInit {
  _config: Config;

  /** Table for persisting result logs. */
  private _resultsLogTable: Dexie.Table<any, number>;

  /** Table for persisting submission log */
  private _submissionLogTable: Dexie.Table<any, number>;

  /** Table for persisting interaction logs. */
  private _interactionLogTable: Dexie.Table<DresTypeConverter, number>;

  _dresStatus = ''
  _dresStatusBadgeValue: string;

  maxLength = 600;
  mode: TemporalMode = 'TEMPORAL_DISTANCE'

  cineast = ((c: Config) => c.cineastEndpointWs);
  dresAddress = ((c: Config) => c._config.competition.host)
  hostThumbnails = ((c: Config) => c._config.resources.host_thumbnails)
  hostObjects = ((c: Config) => c._config.resources.host_objects)

  /**
   * Constructor for PreferencesComponent
   */
  constructor(
    private _configService: AppConfig,
    private _db: DatabaseService,
    private _submissionService: VbsSubmissionService,
    private _notificationService: NotificationService
  ) {
    this._configService.configAsObservable.subscribe(c => this._config = c)
    this._resultsLogTable = _db.db.table('log_results');
    this._interactionLogTable = _db.db.table('log_interaction');
    this._submissionLogTable = _db.db.table('log_submission');
  }

  public onModeChanged(mode: TemporalMode) {
    this.mode = mode;
    this._configService.config.mode = mode
  }

  public onMaxLengthSaveClicked() {
    this._configService.config.maxLength = this.maxLength
  }

  /**
   * Resets the config and reloads it.
   */
  public onResetButtonClicked() {
    this._configService.load();
    this.mode = 'TEMPORAL_DISTANCE';
  }

  /**
   * Downloads the interaction logs as zipped JSON.
   */
  public onDownloadInteractionLog() {
    const data = [];
    fromPromise(this._interactionLogTable.orderBy('id').each((o, c) => {
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
    fromPromise(this._resultsLogTable.orderBy('id').each((o, c) => {
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
    fromPromise(this._submissionLogTable.orderBy('id').each((o, c) => {
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
    this._submissionService.statusObservable.subscribe(status => {
        if (status) {
          this._dresStatus = `${status.sessionId}`
          return;
        }
        this._dresStatus = 'not logged in'
        return
      },
      error => {
        this._dresStatus = 'not logged in'
      })
    this._notificationService.getDresStatusBadgeObservable().subscribe(el => this._dresStatusBadgeValue = el)
  }
}
