import {AfterContentInit, Component, EventEmitter, Output} from '@angular/core';
import {Config} from '../../shared/model/config/config.model';
import {Hint} from '../../shared/model/messages/interfaces/requests/query-config.interface';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {first, map} from 'rxjs/operators';
import {AppConfig} from '../../app.config';
import {Observable} from 'rxjs';
import {TemporalMode} from './temporal-mode-container.model';

@Component({
  selector: 'app-temporal-management',
  templateUrl: './temporal-management.component.html'
})
export class TemporalManagementComponent implements AfterContentInit {

  /** The current configuration as observable. */
  private _config: Observable<Config>;

  maxLength = 600;

  mode: TemporalMode = 'TEMPORAL_DISTANCE';

  /** Output emitter to update the current temporal mode */
  @Output() onModeChange = new EventEmitter<any>();

  /**
   * Constructor for PreferencesComponent
   */
  constructor(
    private _configService: AppConfig
  ) {
    this._config = this._configService.configAsObservable;
  }

  /** On a mode change, update the mode by emitting the current mode */
  public onModeChanged() {
    this.onModeChange.emit(this.mode);
  }

  public isTimeDistance(): boolean {
    return this.mode === 'TEMPORAL_DISTANCE';
  }

  public getTemporalMaxLengthFromUser(): number {
    return this.maxLength;
  }

  ngAfterContentInit(): void {
  }
}
