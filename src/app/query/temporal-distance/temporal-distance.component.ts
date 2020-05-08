import {Component, OnInit} from '@angular/core';
import {TemporalDistance, TemporalQualifier} from './temporal-distance.model';

@Component({
  selector: 'app-temporal-distance',
  templateUrl: './temporal-distance.component.html',
  styleUrls: ['./temporal-distance.component.css']
})
export class TemporalDistanceComponent implements OnInit {

  qualifier: TemporalQualifier = 'LESS';

  time = 30; // seconds

  constructor() {
  }

  ngOnInit() {
  }

  public getTemporalDistanceFromUser(): TemporalDistance {
    return new TemporalDistance(this.time, this.qualifier);
  }

}
