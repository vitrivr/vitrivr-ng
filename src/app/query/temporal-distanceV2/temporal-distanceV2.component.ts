import {Component, OnInit} from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-temporal-distanceV2',
  templateUrl: './temporal-distanceV2.component.html',
  styleUrls: ['./temporal-distanceV2.component.css']
})
export class TemporalDistanceV2Component implements OnInit {

  time = 30; // seconds

  constructor() {
  }

  ngOnInit() {
  }

  public getTemporalDistanceFromUser(): number {
    return this.time;
  }

}
