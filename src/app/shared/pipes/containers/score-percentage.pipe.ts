import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'ScorePercentagePipe'
})
export class ScorePercentagePipe implements PipeTransform {

  public transform(score: number): number {
    return Math.round(score * 1000) / 10
  }
}
