import {Component, OnInit} from '@angular/core';
import {ResultSetInfoService} from '../../core/queries/result-set-info.service';
import {Tag} from '../../shared/model/misc/tag.model';
import {Caption} from '../../shared/model/misc/caption.model';


@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
})
/**
 * Component that displays information about the result set
 */
export class InformationComponent implements OnInit {
  /** The current configuration as observable. */
  /** Local reference to the subscription to the QueryService. */
  public _tagOccurrence: Tag[];
  public _captionOccurrence: Caption[];
  message: string;

  // tagOccurrence = new Map([['foo', 3], ['bar', 5], ['tar', 2]]);

  constructor(private _resultSetInfoService: ResultSetInfoService) {
  }

  /**
   * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
   */
  public ngOnInit(): void {
    this._resultSetInfoService.currentMessage.subscribe(message => this._tagOccurrence = message);
    this._resultSetInfoService.currentCaption.subscribe(message => this._captionOccurrence = message);
    // console.log('IC: message: ', this._tagOccurrenceMap);
  }


}
