import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TagOcurrenceModel} from '../../shared/model/misc/tagOcurrence.model';
import {Tag} from '../../shared/model/misc/tag.model';

@Injectable({
  providedIn: 'root'
})
export class ResultSetInfoService {
  one = 'one';
  topTagsArray: Map<string, number>;
  private messageSource = new BehaviorSubject(this.topTagsArray);
  currentMessage = this.messageSource.asObservable();

  constructor() {
  }

  changeMessage(message: Map<string, number>) {
    this.messageSource.next(message)
    console.log('CHANGING: ', message)
  }

}


