import {Component, OnInit} from '@angular/core';
import {ResultSetInfoService} from '../../core/queries/result-set-info.service';
import {Preference, Tag} from '../../shared/model/misc/tag.model';
import {Caption} from '../../shared/model/misc/caption.model';
import {QueryService} from '../../core/queries/query.service';
import {filter, map} from 'rxjs/operators';


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
  public tagOccurrence: Tag[];
  public captionOccurrence: Caption[];
  public scores: number[] = [];
  public message: string;
  public newTagForQuery: Tag;
  private preferenceMust = Preference.MUST;
  private preferenceCould = Preference.COULD;
  private preferenceNot = Preference.NOT;

  constructor(private _resultSetInfoService: ResultSetInfoService, private _queryService: QueryService) {
  }

  /**
   * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
   */
  public ngOnInit(): void {
    this.resultSetInfoService.currentNewTagForQuery.subscribe(message => this.newTagForQuery = message);
    this.resultSetInfoService.currentTopTagsArray.subscribe(message => {
      this.tagOccurrence = message;
      /*this.queryService.results.segmentsAsObservable.pipe(
        map(segments => segments.filter(segment => segment.score >= 0.8))
      ).subscribe(scores => {
        console.log('segment.score= ', scores);
        this._scores[0] = scores.length;
      });*/
    });
    this.resultSetInfoService.currentCaption.subscribe(message => this.captionOccurrence = message);

    this.queryService.observable.pipe(
      filter(msg => {
        return ['STARTED'].indexOf(msg) > -1;
      })
    ).subscribe((msg) => {
      this.tagOccurrence = []
      this.captionOccurrence = []
      this.scores = []
    });

    this.queryService.observable.pipe(
      filter(msg => {
        return ['ENDED'].indexOf(msg) > -1;

      })
    ).subscribe((msg) => {
      this.queryService.results.segmentsAsObservable.pipe(
        map(segments => segments.filter(segment => segment.score >= 0.8))
      ).subscribe(scores => {
        this.scores[0] = scores.length;
      });
      this.queryService.results.segmentsAsObservable.pipe(
        map(segments => segments.filter(segment => segment.score >= 0.6 && segment.score < 0.8))
      ).subscribe(scores => {
        this.scores[1] = scores.length;
      });
      this.queryService.results.segmentsAsObservable.pipe(
        map(segments => segments.filter(segment => segment.score >= 0.4 && segment.score < 0.6))
      ).subscribe(scores => {
        this.scores[2] = scores.length;
      });
      this.queryService.results.segmentsAsObservable.pipe(
        map(segments => segments.filter(segment => segment.score >= 0.0 && segment.score < 0.4))
      ).subscribe(scores => {
        this.scores[3] = scores.length;
      });
    });

  }

  get queryService(): QueryService {
    return this._queryService;
  }

  get resultSetInfoService(): ResultSetInfoService {
    return this._resultSetInfoService;
  }

  onPreferenceChange(preference: Preference, tag: Tag) {
    tag.preference = preference;
    console.log('want to add to query: ', tag);
    this.resultSetInfoService.changeTagForQuery(tag);
  }

  getPreference(tag: Tag) {
    return tag.preference;
  }

  ifPreferenceExists(tag: Tag) {
    return tag.preference != null;
  }

}
