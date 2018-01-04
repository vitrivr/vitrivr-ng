import {ChangeDetectorRef, OnDestroy, OnInit} from "@angular/core";
import {ResultsContainer} from "../shared/model/features/scores/results-container.model";
import {QueryChange, QueryService} from "../core/queries/query.service";
import {SegmentScoreContainer} from "../shared/model/features/scores/segment-score-container.model";
import {ScoreContainer} from "../shared/model/features/scores/compound-score-container.model";
import {Observable} from "rxjs/Observable";

export abstract class AbstractResultsViewComponent<T> implements OnInit, OnDestroy  {
    /* Indicator whether the progress bar should be visible. */
    private _loading : boolean = false;

    /** Local reference to the subscription to the QueryService. */
    protected _queryServiceSubscription;

    /** Local reference to the data source holding the query results.*/
    protected _dataSource : Observable<T> = Observable.empty();

    /**
     * Default constructor.
     *
     * @param _cdr Reference to ChangeDetectorRef used to inform component about changes.
     * @param _queryService
     */
    constructor(protected _cdr: ChangeDetectorRef, protected _queryService : QueryService) {

    }

    /**
     * Calculates and returns a green colour with a varying intensity based on the provided score.
     *
     * @param {number} score
     * @return String that encodes the RGB value.
     */
    public colorForSegment(segment: SegmentScoreContainer): string {
        let score = segment.score;
        let v = Math.round(255.0 - (score * 255.0));
        if (segment.marked)  {
            return "#" + ((1 << 24) + (v << 16) + (v << 8) + 255).toString(16).slice(1);
        } else {
            return "#" + ((1 << 24) + (v << 16) + (255 << 8) + v).toString(16).slice(1);
        }
    }

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit(): void {
        this._queryServiceSubscription = this._queryService.observable
            .filter(msg => ["STARTED", "ENDED", "ERROR", "CLEAR"].indexOf(msg) > -1)
            .subscribe((msg) => this.onQueryStateChange(msg));
        this.subscribe(this._queryService.results);
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the QueryService and ResultsContainer subscription.
     */
    public ngOnDestroy() {
        this._queryServiceSubscription.unsubscribe();
        this._queryServiceSubscription = null;
    }

    /**
     * Getter for loading.
     *
     * @return {boolean}
     */
    get loading(): boolean {
        return this._loading;
    }

    /**
     *
     * @return {Observable<T>}
     */
    get dataSource(): Observable<T> {
        return this._dataSource;
    }


    /**
     * Invoked whenever the QueryService reports that the results were updated. Causes
     * the gallery to be re-rendered.
     *
     * @param msg QueryChange message
     */
    protected onQueryStateChange(msg: QueryChange) {
        switch (msg) {
            case 'STARTED':
                this._loading = true;
                this.subscribe(this._queryService.results);
                break;
            case 'ENDED':
            case 'ERROR':
                this._loading = false;
                break;
            case 'CLEAR':
                this._dataSource = Observable.empty();
                break;
        }
        this._cdr.markForCheck();
    }

    /**
     *
     * @param {ResultsContainer} results
     */
    protected abstract subscribe(results: ResultsContainer);
}