import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Tag} from '../../shared/model/misc/tag.model';
import {CaptionWithCount} from '../../shared/model/misc/caption-with-count.model';

@Injectable({
  providedIn: 'root'
})
export class ResultSetInfoService {
  topTagsArray: Tag[];
  private topTagsSource = new BehaviorSubject([]);
  currentTopTagsArray = this.topTagsSource.asObservable();

  topCaptionsArray: CaptionWithCount[];
  private captionSource = new BehaviorSubject([]);
  currentCaption = this.captionSource.asObservable();

  newTagForQuery: Tag;
  private newTagForQuerySource = new BehaviorSubject(null);
  currentNewTagForQuery = this.newTagForQuerySource.asObservable();

  constructor() {
  }

  changeMessage(message: Tag[]) {
    this.topTagsSource.next(message)
  }

  changeCaption(message: CaptionWithCount[]) {
    this.captionSource.next(message)
  }

  changeTagForQuery(message: Tag) {
    this.newTagForQuerySource.next(message);
  }

}


