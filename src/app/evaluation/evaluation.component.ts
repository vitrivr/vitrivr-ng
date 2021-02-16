import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {QueryChange, QueryService} from '../core/queries/query.service';
import {EvaluationEvent} from '../shared/model/evaluation/evaluation-event';
import {EvaluationState} from '../shared/model/evaluation/evaluation-state';
import {ResolverService} from '../core/basics/resolver.service';
import {MediaObjectScoreContainer} from '../shared/model/results/scores/media-object-score-container.model';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EvaluationTemplate} from '../shared/model/evaluation/evaluation-template';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {EvaluationSet} from '../shared/model/evaluation/evaluation-set';
import {ScenarioDetailsDialogComponent} from './scenario-details-dialog.component';
import {GalleryComponent} from '../results/gallery/gallery.component';
import {EvaluationService} from '../core/evaluation/evaluation.service';
import {Location} from '@angular/common';
import {Observable, of, throwError, zip} from 'rxjs';
import {EvaluationScenario} from '../shared/model/evaluation/evaluation-scenario';
import {SelectionService} from '../core/selection/selection.service';
import {Config} from '../shared/model/config/config.model';
import {EventBusService} from '../core/basics/event-bus.service';
import {catchError, first, flatMap, map} from 'rxjs/operators';
import {FilterService} from '../core/queries/filter.service';


type DisplayType = 'NONE' | 'SCENARIO' | 'GALLERY' | 'HISTORY';

@Component({

  selector: 'app-evaluation',
  templateUrl: 'evaluation.component.html',
  styleUrls: ['evaluation.component.css']
})
export class EvaluationComponent extends GalleryComponent implements OnInit, OnDestroy {
  /** Reference to the current evaluation object. */
  private _template: EvaluationTemplate;

  /** Reference to the current evaluation object. */
  private _evaluationset: EvaluationSet;

  constructor(
    _cdr: ChangeDetectorRef,
    _queryService: QueryService,
    _filterService: FilterService,
    _selectionService: SelectionService,
    _evemtBusService: EventBusService,
    _resolver: ResolverService,
    _router: Router,
    _snackBar: MatSnackBar,
    private _location: Location,
    private _evaluation: EvaluationService,
    private _route: ActivatedRoute,
    private _dialog: MatDialog) {
    super(_cdr, _queryService, _filterService, _selectionService, _evemtBusService, _router, _snackBar, _resolver);
  }

  /**
   * Getter for evaluation set.
   *
   * @return {EvaluationSet}
   */
  get evaluationset(): EvaluationSet {
    return this._evaluationset;
  }

  /**
   * Getter for the currently active scenario.
   *
   * @return {any}
   */
  get currentScenario(): EvaluationScenario {
    if (this._evaluationset && this._template) {
      return this._template.evaluationScenario(this._evaluationset.position);
    } else {
      return null;
    }
  }

  /**
   * Lifecycle Hook (onInit): Subscribes to the QueryService observable and to changes of the Router class. Whenever the parameter
   * becomes available, the onParamsAvailable method is invoked.
   */
  public ngOnInit() {
    super.ngOnInit();
    this._route.params.pipe(first()).subscribe((params: Params) => this.onParamsAvailable(params));
  }

  /**
   * Invoked whenever the 'Start Scenario' button is clicked.
   */
  public onEvaluationStartButtonClick() {
    if (this.canBeStarted()) {
      this._evaluationset.current.start();
      this.saveEvaluation();
      this._snackBar.open('Evaluation started. Happy searching!', null, {duration: Config.SNACKBAR_DURATION});
    }
  }

  /**
   * Invoked whenever the 'Abort Scenario' button is clicked.
   */
  public onEvaluationAbortButtonClick() {
    if (this.canBeAborted()) {
      this._evaluationset.current.abort();
      this.saveEvaluation();
      this._snackBar.open('Scenario aborted. You can restart it any time.', null, {duration: Config.SNACKBAR_DURATION});
    }
  }

  /**
   * Invoked whenever the 'Complete Scenario' button is clicked.
   */
  public onEvaluationCompleteButtonClick() {
    if (this.canBeCompleted() && this._evaluationset.current.state == EvaluationState.RankingResults) {
      this._evaluationset.current.complete();
      if (!this._evaluationset.next()) {
        this._snackBar.open('Evaluation completed. Thank you for participating!', null, {duration: Config.SNACKBAR_DURATION});
      } else {
        this._snackBar.open('Next scenario is up ahead!', null, {duration: Config.SNACKBAR_DURATION});
        this._queryService.clear()
      }
      this.saveEvaluation();
    }
  }

  /**
   * Invoked whenever the 'Accept results' button is clicked.
   */
  public onResultsAcceptButtonClick() {
    if (this.canBeAccepted()) {
      this._dataSource.pipe(first()).subscribe(m => {
        if (this._evaluationset.current.accept(this._queryService.results.features, m) == EvaluationState.RankingResults) {
          this.saveEvaluation();
          this._snackBar.open('Results accepted. Now please rate the relevance of the top ' + this._evaluationset.current.k + ' results.', null, {duration: Config.SNACKBAR_DURATION});
        }
      });
    }
  }

  /**
   * Invoked whenever the 'Download results' button is clicked.
   */
  public onDownloadButtonClick() {
    this._evaluation.evaluationData().pipe(first()).subscribe((zip) => {
      zip.generateAsync({type: 'blob'}).then(
        (result) => {
          window.open(window.URL.createObjectURL(result));
        },
        (error) => {
          console.log(error);
          this._snackBar.open('Failed to create downloadable results (JSZip error).', null, {duration: Config.SNACKBAR_DURATION});
        }
      )
    });
  }

  /**
   * This method is invoked whenever someone hits the ranking (star) buttons on an object.
   *
   * @param object MediaObjectScoreContainer for which the star button was clicked.
   * @param rating The rating that was given to the MediaObjectScoreContainer
   */
  public onRateButtonClick(object: MediaObjectScoreContainer, rating: number) {
    if (!this.canBeRated()) {
      return;
    }
    this._dataSource.pipe(
      first(),
      map(m => m.indexOf(object))
    ).subscribe(i => {
      this._evaluationset.current.rate(i, rating);
      this.saveEvaluation();
    });
  }

  /**
   * Invoked whenever the 'Scenario' chip is clicked.
   */
  public onScenarioClick() {
    if (!this._evaluationset) {
      return;
    }
    const config = new MatDialogConfig();
    config.width = '500px';
    config.data = this.currentScenario;
    this._dialog.open(ScenarioDetailsDialogComponent, config);
  }

  /**
   * Returns the colour of the star-button for the specified mediaobject and the specified rank.
   * If the button is active, then the colour will be yellow otherwise it is white.
   *
   * @param object MediaObjectScoreContainer to which the star-button belongs.
   * @param rank Rank the star-button is representing.
   * @returns {any}
   */
  public colorForButton(object: MediaObjectScoreContainer, rank: number): Observable<string> {
    return this._dataSource.pipe(
      map(m => {
        const i = m.indexOf(object);
        const objectrank = this._evaluationset.current.getRating(i);
        if (objectrank >= rank) {
          return '#FFD700';
        } else {
          return '#FFFFFF';
        }
      })
    );
  }

  /**
   * Returns a string descriptor of the current scenario or an
   * indication if no scenario is currently active.
   *
   * @return {string}
   */
  public scenarioDescriptor(): string {
    if (!this._evaluationset) {
      return 'n/a';
    }
    if (!this._template) {
      return 'loading...';
    }
    return this._template.evaluationScenario(this._evaluationset.position).name + ' (' + (this._evaluationset.position + 1) + '/' + this._evaluationset.count() + ')';
  }

  /**
   * Returns a string descriptor of the current scenario state or
   * an indication if no scenario is currently active.
   *
   * @returns {string}
   */
  public stateDescriptor(): string {
    if (!this._evaluationset) {
      return 'n/a';
    }
    switch (this._evaluationset.current.state) {
      case EvaluationState.NotStarted:
        return 'Not started';
      case EvaluationState.RunningQueries:
        return 'Running queries';
      case EvaluationState.RankingResults:
        return 'Ranking results';
      case EvaluationState.Aborted:
        return 'Aborted';
      case EvaluationState.Finished:
        return 'Finished';
    }
  }

  /**
   * Returns a string descriptor of the current scenario state or
   * an indication if no scenario is currently active.
   *
   * @returns {string}
   */
  public stateColor(): string {
    if (!this._evaluationset) {
      return '';
    }
    switch (this._evaluationset.current.state) {
      case EvaluationState.NotStarted:
        return '';
      case EvaluationState.RunningQueries:
        return 'accent';
      case EvaluationState.RankingResults:
        return 'accent';
      case EvaluationState.Aborted:
        return 'warn';
      case EvaluationState.Finished:
        return '#00FF00';
    }
  }

  /**
   * Returns true if a new Evaluation can be started and false otherwise.
   *
   * Used to make UI related decisions.
   */
  public canBeStarted(): boolean {
    if (this._evaluationset == null) {
      return false;
    }
    return this._evaluationset.current.state == EvaluationState.NotStarted || this._evaluationset.current.state == EvaluationState.Aborted
  }

  /**
   * Returns true if the current Evaluation can be stopped or aborted and false
   * otherwise.
   *
   * Used to make UI related decisions.
   */
  public canBeAborted(): boolean {
    if (this._evaluationset == null) {
      return false;
    }
    return this._evaluationset.current.state != EvaluationState.NotStarted && this._evaluationset.current.state != EvaluationState.Aborted;
  }

  /**
   *
   * @return {boolean}
   */
  public canBeCompleted(): boolean {
    if (this._evaluationset == null) {
      return false;
    }
    return this._evaluationset.current.state == EvaluationState.RankingResults

  }

  /**
   * Returns true if the current Evaluation has results available that can be accepted false
   * otherwise.
   *
   * Used to make UI related decisions.
   */
  public canBeAccepted(): boolean {
    if (this._evaluationset == null) {
      return false;
    }
    return this._evaluationset.current.state == EvaluationState.RunningQueries;
  }

  /**
   * Returns true if the current Evaluation allows for ranking and false otherwise.
   *
   * Used to make UI related decisions.
   */
  public canBeRated(): boolean {
    if (this._evaluationset == null) {
      return false;
    }
    return this._evaluationset.current.state == EvaluationState.RankingResults;
  }

  /**
   * Returns true, if the evaluation history should be displayed, and false otherwise.
   *
   * @return {boolean}
   */
  public display(): DisplayType {
    if (!this._evaluationset || !this._evaluationset.current) {
      return 'NONE';
    }
    switch (this._evaluationset.current.state) {
      case EvaluationState.Finished:
        return 'HISTORY';
      case EvaluationState.NotStarted:
      case EvaluationState.Aborted:
        return 'SCENARIO';
      default:
        return 'GALLERY';
    }
  }

  /**
   * Returns true if the provided MediaObject can be rated and false otherwise. This
   * depends on the current state of the evaluation and its rank.
   *
   * Used to make UI related decisions.
   *
   * @param mediaobject MediaObject that should be checked.
   */
  public objectCanBeRated(mediaobject: MediaObjectScoreContainer): Observable<boolean> {
    if (this.canBeRated() == false) {
      of(false);
    }
    return this.dataSource.pipe(
      map(m => m.indexOf(mediaobject) < this._evaluationset.current.k)
    );
  }

  /**
   * Returns true if the provided MediaObject has already been rated and false otherwise.
   *
   * Used to make UI related decisions.
   *
   * @param mediaobject MediaObject that should be checked.
   */
  public objectHasBeenRated(mediaobject: MediaObjectScoreContainer): Observable<boolean> {
    if (this.canBeRated() == false) {
      of(false);
    }
    return this.dataSource.pipe(
      map(m => m.indexOf(mediaobject)),
      map(i => this._evaluationset.current.ratings[i] && this._evaluationset.current.ratings[i].rating > -1)
    );
  }

  /**
   * Invoked whenever the QueryService reports that the results were updated. Causes
   * the gallery to be re-rendered.
   *
   * @param msg QueryChange message
   */
  protected onQueryStateChange(msg: QueryChange) {
    let event = null;
    switch (msg) {
      case 'STARTED':
        if (this._evaluationset && this.canBeStarted()) {
          this._evaluationset.current.start();
          this.saveEvaluation();
        }
        event = new EvaluationEvent(this._queryService.results.queryId, new Date(), 'STARTED', null);
        break;
      case 'FEATURE':
        event = new EvaluationEvent(this._queryService.results.queryId, new Date(), 'FEATURE_AVAILABLE', this._queryService.results.features[this._queryService.results.features.length - 1].readableName);
        break;
      case 'ENDED':
        event = new EvaluationEvent(this._queryService.results.queryId, new Date(), 'ENDED', null);
        break;
      case 'UPDATED':
        break;
    }

    /* Add evaluation event. */
    if (event && this._evaluationset && this._evaluationset.current.state == EvaluationState.RunningQueries) {
      this._evaluationset.current.addEvent(event);
      this.saveEvaluation();
    }

    /* Call super. */
    super.onQueryStateChange(msg);
  }

  /**
   * Tries to save the recent changes to the evaluation using the evaluation service.
   */
  private saveEvaluation() {
    this._evaluation.saveEvaluation(this._evaluationset).pipe(first()).subscribe(
      () => {
      },
      (error) => {
        console.log(error);
        this._snackBar.open('Could not persist the recent changes to the evaluation. Proceed with caution...', null, {duration: Config.SNACKBAR_DURATION});
      }
    );
  }

  /**
   * Invoked once parameters from the routing become available. Tries
   * to load the specified evaluation template.
   */
  private onParamsAvailable(params: Params) {
    const participant = params['participant'];
    const template = params['template'] ? atob(params['template']) : null;
    const name = params['name'] ? atob(params['name']) : null;
    if (template && participant) {
      this.loadRunningEvaluation(participant).pipe(
        catchError((error, caught: Observable<void>) => {
          return this.startNewEvaluation(template, participant, name)
        }),
        first()
      ).subscribe(
        () => {
          this._snackBar.open('Evaluation started successfully. Welcome \'' + this._evaluationset.name + '\'! Thank you for participating.', null, {duration: Config.SNACKBAR_DURATION});
        },
        (error) => {
          console.log(error);
          this._snackBar.open('Could not load the specified evaluation template due to an error.', null, {duration: Config.SNACKBAR_DURATION}).afterDismissed().pipe(first()).subscribe(() => {
            this._location.back();
          });
        }
      );
    } else if (participant) {
      this.loadRunningEvaluation(participant).pipe(first()).subscribe(
        () => {
          this._snackBar.open('Evaluation resumed successfully. Welcome back\'' + this._evaluationset.name + '\'!', null, {duration: Config.SNACKBAR_DURATION});
        },
        (error) => {
          console.log(error);
          this._snackBar.open('Could not load the specified evaluation template due to an error.', null, {duration: Config.SNACKBAR_DURATION}).afterDismissed().pipe(first()).subscribe(() => {
            this._location.back();
          });
        }
      );
    } else {
      this._snackBar.open('Could not load the evaluation module because some information is missing.', null, {duration: Config.SNACKBAR_DURATION}).afterDismissed().pipe(first()).subscribe(() => {
        this._location.back();
      });
    }
  }

  /**
   * Tries to resume a running evaluation given a participant ID.
   *
   * @param participant Participant ID for the running evaluation.
   * @return {boolean} true if a running evaluation could be loaded from local storage, false otherwise.
   */
  private loadRunningEvaluation(participant: string): Observable<void> {
    return this._evaluation.loadEvaluation(participant).pipe(
      first(),
      flatMap((evaluation) => {
        return zip(of(evaluation), this._evaluation.loadEvaluationTemplate(evaluation.template), (evaluation, template) => {
          if (template != null) {
            this._evaluationset = evaluation;
            this._template = template;
          } else {
            throwError('Failed to load the evaluation template from \'' + evaluation.template + '\'.');
          }
        });
      })
    );
  }

  /**
   * Tries to load an evaluation template (JSON-file) from the specified URL location and start
   * a new evaluation based on that template.
   *
   * @param url URL from which to load the template.
   * @param participant ID of the participant.
   * @param name Optional name of the participant.
   */
  private startNewEvaluation(url: string, participant: string, name?: string): Observable<void> {
    return this._evaluation.loadEvaluationTemplate(url).pipe(
      first(),
      map((template) => {
        if (template != null) {
          this._template = template;
          this._evaluationset = EvaluationSet.fromTemplate(participant, template, name);
        } else {
          throwError('Failed to load the evaluation template from \'' + template + '\'.');
        }
      })
    );
  }
}
