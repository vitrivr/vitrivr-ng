import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-temporal-length-container',
  templateUrl: 'temporal-length-container.component.html',
  styleUrls: ['./temporal-length-container.component.css']
})

export class TemporalLengthContainerComponent {

  maxLength = 600;

  constructor() {
  }

  public getTemporalMaxLengthFromUser(): number {
    return this.maxLength;
  }
}
