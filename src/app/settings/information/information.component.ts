import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ResultSetInfoService} from '../../core/queries/result-set-info.service';
import {Preference, Tag} from '../../shared/model/misc/tag.model';
import {Caption} from '../../shared/model/misc/caption.model';
import {QueryService} from '../../core/queries/query.service';
import {filter, map} from 'rxjs/operators';
import {Options, TagCloud, Word} from 'd3-tagcloud';
import {ThemePalette} from '@angular/material/core';
import {FormControl} from '@angular/forms';


@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
})
/**
 * Component that displays information about the result set
 */
export class InformationComponent implements OnInit, AfterViewInit {


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

  public tagCloud: TagCloud;
  @ViewChild('cloud') cloud: ElementRef;

  /** number of related tags to be shown in query refinement tab */
  @Input() public numberOfRelatedTagsShown: number;
  /** number of terms used in captions to be shown in query refinement tab */
  @Input() public numberOfCaptionTermsShown: number;

  color: ThemePalette = 'accent';
  checked = false;
  listTrue: boolean;

  toggle = new FormControl('', []);

  constructor(private _resultSetInfoService: ResultSetInfoService, private _queryService: QueryService) {
  }

  /**
   * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
   */
  public ngOnInit(): void {
    this.toggle.valueChanges.subscribe(newToggleValue => {
      this.listTrue = newToggleValue;
    });

    this.resultSetInfoService.currentNewTagForQuery.subscribe(message => this.newTagForQuery = message);
    this.resultSetInfoService.currentTopTagsArray.subscribe(message => {
      this.tagOccurrence = message;
    });
    this.resultSetInfoService.currentCaption.subscribe(message => {
      this.captionOccurrence = message;
      if (this.tagCloud) {
        this.tagCloud.setData(this.captionToWord(this.captionOccurrence));
        console.log(JSON.stringify(this.captionToWord(this.captionOccurrence)));
        this.tagCloud.resize();
      }
    });

    this.queryService.observable.pipe(
      filter(msg => {
        return ['STARTED'].indexOf(msg) > -1;
      })
    ).subscribe(() => {
      this.tagOccurrence = [];
      this.captionOccurrence = [];
      this.scores = [];
    });

    this.queryService.observable.pipe(
      filter(msg => {
        return ['ENDED'].indexOf(msg) > -1;

      })
    ).subscribe(() => {
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

    this.numberOfRelatedTagsShown = 10;
    this.numberOfCaptionTermsShown = 25;


  }

  ngAfterViewInit() {
    this.tagCloud = new TagCloud(this.cloud.nativeElement);
    const options: Options = {
      orientation: 'single' //  default is 'right angled','single','right angled','multiple'
    };
    this.tagCloud.setOptions(options);
  }


  get queryService(): QueryService {
    return this._queryService;
  }

  get resultSetInfoService(): ResultSetInfoService {
    return this._resultSetInfoService;
  }

  /** called to add a related tag to query */
  onPreferenceChange(preference: Preference, tag: Tag) {
    tag.preference = preference;
    this.resultSetInfoService.changeTagForQuery(tag);
  }

  getPreference(tag: Tag) {
    return tag.preference;
  }

  ifPreferenceExists(tag: Tag) {
    return tag.preference != null;
  }

  changeNumberOfTagsShown() {
    return this.numberOfRelatedTagsShown;
  }

  captionToWord(captionTerms: Caption[]): Word[] {
    const words = [] as Array<Word>;
    for (let i = 0; i < 25; i++) {
      const word = {} as Word;
      word.text = captionTerms[i].caption;
      word.value = captionTerms[i].occurrence;
      words.push(word);
    }
    return words;
  }


}


