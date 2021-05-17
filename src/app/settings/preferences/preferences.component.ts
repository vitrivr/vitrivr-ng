import {AfterContentInit, Component} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Config} from '../../shared/model/config/config.model';
import {Hint} from '../../shared/model/messages/interfaces/requests/query-config.interface';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {first, map} from 'rxjs/operators';
import {DatabaseService} from '../../core/basics/database.service';
import Dexie from 'dexie';
import {DresTypeConverter} from '../../core/vbs/dres-type-converter.util';
import {fromPromise} from 'rxjs/internal-compatibility';
import * as JSZip from 'jszip';
import {VbsSubmissionService} from '../../core/vbs/vbs-submission.service';
import {NotificationService} from '../../core/basics/notification.service';
import {AppConfig} from '../../app.config';

@Component({

  selector: 'app-preferences',
  templateUrl: './preferences.component.html'
})
export class PreferencesComponent implements AfterContentInit {

  /** The current configuration as observable. */
  private _config: Observable<Config>;

  /** Table for persisting result logs. */
  private _resultsLogTable: Dexie.Table<any, number>;

  /** Table for persisting submission log */
  private _submissionLogTable: Dexie.Table<any, number>;

  /** Table for persisting interaction logs. */
  private _interactionLogTable: Dexie.Table<DresTypeConverter, number>;

  private _dresStatus: BehaviorSubject<string> = new BehaviorSubject<string>('')
  _dresStatusBadgeValue: string;

  /**
   * Constructor for PreferencesComponent
   */
  constructor(
    private _configService: AppConfig,
    private _db: DatabaseService,
    private _submissionService: VbsSubmissionService,
    private _notificationService: NotificationService
  ) {
    this._config = this._configService.configAsObservable;
    this._resultsLogTable = _db.db.table('log_results');
    this._interactionLogTable = _db.db.table('log_interaction');
    this._submissionLogTable = _db.db.table('log_submission');
  }

  /**
   * Getter for Cineast endpoint
   *
   * @return {Observable<string>}
   */
  get cineastEndpoint(): Observable<string> {
    return this._config.pipe(map(c => c.cineastEndpointWs));
  }

  get dresEnabled(): Observable<boolean> {
    return this._config.pipe(map(c => c._config.competition.host != null))
  }

  get dresAddress(): Observable<string> {
    return this._config.pipe(map(c => c._config.competition.host))
  }

  get dresStatus(): Observable<string> {
    return this._dresStatus.asObservable()
  }

  /**
   * Getter for thumbnail host.
   *
   * @return {Observable<string>}
   */
  get hostThumbnails(): Observable<string> {
    return this._config.pipe(map(c => c.get<string>('resources.host_thumbnails')));
  }

  /**
   * Getter for media object host
   *
   * @return {Observable<string>}
   */
  get hostObjects(): Observable<string> {
    return this._config.pipe(map(c => c.get<string>('resources.host_objects')));
  }

  /**
   * Getter for whether or not the inexact-hint in the current QueryConfig is active.
   *
   * @return {Observable<boolean>}
   */
  get useInexactIndex(): Observable<boolean> {
    return this._config.pipe(
      map(c => c.get<Hint[]>('query.config.hints')),
      map(h => h.indexOf('inexact') > -1 && h.indexOf('exact') === -1)
    );
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


  /**
   * Triggered whenever the user changes the value of the UseInexactIndex setting.
   *
   * @param {MatSlideToggleChange} e The associated change event.
   */
  public onUseInexactIndexChanged(e: MatSlideToggleChange) {
    this._config.pipe(first()).subscribe(c => {
      const hints = c.get<Hint[]>('query.config.hints').filter(h => ['inexact', 'exact'].indexOf(h) === -1);
      if (e.checked === true) {
        hints.push('inexact');
      } else {
        hints.push('exact');
      }
      c.set('query.config.hints', hints);
    });
  }

  ngAfterContentInit(): void {
    this._submissionService.statusObservable.subscribe(status => {
      if (status) {
        if (status) {
          this._dresStatus.next(`${status.sessionId}`)
          return;
        }
        this._dresStatus.next('not logged in')
        return
      }
    })
    this._notificationService.getDresStatusBadgeObservable().subscribe(el => this._dresStatusBadgeValue = el)
  }
}
