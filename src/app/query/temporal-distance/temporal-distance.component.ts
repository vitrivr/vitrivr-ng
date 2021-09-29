import {Component, OnInit} from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-temporal-distance',
  templateUrl: './temporal-distance.component.html',
  styleUrls: ['./temporal-distance.component.css']
})
export class TemporalDistanceComponent implements OnInit {

  time = 10; // seconds

  constructor() {
  }

  ngOnInit() {
  }

  public getTemporalDistanceFromUser(): number {
    return this.time;
  }

}
