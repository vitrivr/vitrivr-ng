import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-temporal-distance',
  templateUrl: './temporal-distance.component.html',
  styleUrls: ['./temporal-distance.component.css']
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
