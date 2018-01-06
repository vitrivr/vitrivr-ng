import {ChangeDetectorRef, OnDestroy, OnInit} from "@angular/core";
import {ResultsContainer} from "../shared/model/results/scores/results-container.model";
import {QueryChange, QueryService} from "../core/queries/query.service";
import {SegmentScoreContainer} from "../shared/model/results/scores/segment-score-container.model";
import {ScoreContainer} from "../shared/model/results/scores/compound-score-container.model";
import {Observable} from "rxjs/Observable";
import {SelectionService} from "../core/selection/selection.service";
import {Tag} from "../core/selection/tag.model";
import {ColorUtil} from "../shared/util/color.util";

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
     * @param _selectionService
     */
    constructor(protected _cdr: ChangeDetectorRef, protected _queryService : QueryService, protected _selectionService: SelectionService) {}

    /**
     * Calculates and returns a green colour with a varying intensity based on the provided score.
     *
     * @param {number} segment The segment for which the background should be evaluated.
     * @return String that encodes the RGB value.
     */
    public backgroundForSegment(segment: SegmentScoreContainer): string {
        let score = segment.score;
        let tags: Tag[] = this._selectionService.getTags(segment.segmentId);
        if (tags.length == 0) {
            let v = Math.round(255.0 - (score * 255.0));
            return ColorUtil.rgbToHex(v,255, v);
        } else if (tags.length == 1) {
            return tags[0].colorForRelevance(score);
        } else {
            let width = 100.0/tags.length;
            return "repeating-linear-gradient(90deg," + tags.map((t,i) => t.colorForRelevance(score) + " " + i*width + "%," + t.colorForRelevance(score)+ " " + (i+1)*width + "%").join(",") + ")";
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
     *
     * @return {Tag[]}
     */
    get selectionService(): SelectionService {
        return this._selectionService;
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