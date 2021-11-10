import {Component, OnInit} from '@angular/core';
import {ConfigService} from '../../core/basics/config.service';
import {AppConfig} from '../../app.config';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-temporal-distance',
  templateUrl: './temporal-distance.component.html',
  styleUrls: ['./temporal-distance.component.css']
})
export class TemporalDistanceComponent {

  time = 10; // seconds

  constructor(private _configService: AppConfig) {
    _configService.configAsObservable.subscribe(c => this.time = c._config.query.default_temporal_distance)
  }

  public getTemporalDistanceFromUser(): number {
    return this.time;
  }

}
