import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Tag} from '../../shared/model/misc/tag.model';
import {Caption} from '../../shared/model/misc/caption.model';

@Injectable({
  providedIn: 'root'
})
export class ResultSetInfoService {
  one = 'one';
  topTagsArray: Tag[];
  private messageSource = new BehaviorSubject(this.topTagsArray);
  currentMessage = this.messageSource.asObservable();

  topCaptionsArray: Caption[];
  private captionSource = new BehaviorSubject(this.topCaptionsArray);
  currentCaption = this.captionSource.asObservable();

  constructor() {
  }

  changeMessage(message: Tag[]) {
    this.messageSource.next(message)
  }

  changeCaption(message: Caption[]) {
    this.captionSource.next(message)
  }

}


