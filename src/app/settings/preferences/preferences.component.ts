import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ConfigService} from '../../core/basics/config.service';
import {Observable} from 'rxjs';
import {Config} from '../../shared/model/config/config.model';
import {Hint} from '../../shared/model/messages/interfaces/requests/query-config.interface';
import {MatSlideToggleChange} from '@angular/material';
import {first, map} from 'rxjs/operators';
import {DatabaseService} from "../../core/basics/database.service";
import Dexie from "dexie";
import {VbsResultsLog} from "../../core/vbs/vbs-results-log.model";
import {VbsInteractionLog} from "../../core/vbs/vbs-interaction-log.model";
import {fromPromise} from "rxjs/internal-compatibility";
import * as JSZip from "jszip";

@Component({
  moduleId: module.id,
  selector: 'preferences',
  templateUrl: './preferences.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent {

  /** The current configuration as observable. */
  private _config: Observable<Config>;

  /** Table for persisting result logs. */
  private _resultsLogTable: Dexie.Table<VbsResultsLog, number>;

  /** Table for persisting interaction logs. */
  private _interactionLogTable: Dexie.Table<VbsInteractionLog, number>;

  /**
   * Constructor for PreferencesComponent
   */
  constructor(private _configService: ConfigService, private _db: DatabaseService) {
    this._config = this._configService.asObservable();
    this._resultsLogTable = _db.db.table('log_results');
    this._interactionLogTable = _db.db.table('log_interaction');
  }

  /**
   * Getter for Cineast endpoint
   *
   * @return {Observable<string>}
   */
  get cineastEndpoint(): Observable<string> {
    return this._config.pipe(map(c => c.endpoint_ws));
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
      map(h => h.indexOf('inexact') > -1 && h.indexOf('exact') == -1)
    );
  }

  /**
   * Resets the config and reloads it.
   */
  public onResetButtonClicked() {
    this._configService.reset();
  }

  /**
   * Downloads the interaction logs as zipped JSON.
   */
  public onDownloadInteractionLog() {
    const data = [];
    fromPromise(this._resultsLogTable.orderBy('id').each((o,c) => {data.push(o)}))
      .pipe(
        first(),
        map(h => {
          const stride = 100;
          const max = data.length / stride
          const zip = new JSZip();
          const options = {base64: false, binary: false, date: new Date(), createFolders: false, dir: false};
          for (let i = 0; i < max; i++) {
            zip.file(`vitrivrng-interaction-log_${i}.json`, JSON.stringify(data.slice(stride, Math.max((i + 1) * stride, data.length)), null, 2), options);
          }
          return zip
        })
      )
      .subscribe(zip => {
        zip.generateAsync({type: 'blob'}).then(
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
    fromPromise(this._resultsLogTable.orderBy('id').each((o,c) => {data.push(o)}))
      .pipe(
        first(),
        map(() => {
          const stride = 100;
          const max = data.length / stride
          const zip = new JSZip();
          const options = {base64: false, binary: false, date: new Date(), createFolders: false, dir: false};
          for (let i = 0; i < max; i++) {
            zip.file(`vitrivrng-results-log_${i}.json`, JSON.stringify(data.slice(i * stride, Math.max((i + 1) * stride, data.length)), null, 2), options);
          }
          return zip
        })
      )
      .subscribe(zip => {
        zip.generateAsync({type: 'blob'}).then(
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
      let hints = c.get<Hint[]>('query.config.hints').filter(h => ['inexact', 'exact'].indexOf(h) == -1);
      if (e.checked == true) {
        hints.push('inexact');
      } else {
        hints.push('exact');
      }
      c.set('query.config.hints', hints);
    });
  }
}
