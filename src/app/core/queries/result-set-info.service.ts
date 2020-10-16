import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TagOcurrenceModel} from '../../shared/model/misc/tagOcurrence.model';
import {Tag} from '../../shared/model/misc/tag.model';

@Injectable({
  providedIn: 'root'
})
export class ResultSetInfoService {
  one = 'one';
  topTagsArray: Tag[];
  private messageSource = new BehaviorSubject(this.topTagsArray);
  currentMessage = this.messageSource.asObservable();

  constructor() {
  }

  changeMessage(message: Tag[]) {
    this.messageSource.next(message)
    console.log('CHANGING: ', message)
  }

}


