import {ChangeDetectorRef, OnDestroy, OnInit} from "@angular/core";
import {ResultsContainer} from "../shared/model/features/scores/results-container.model";
import {QueryChange, QueryService} from "../core/queries/query.service";

export abstract class AbstractResultsViewComponent implements OnInit, OnDestroy  {

    /* Indicator whether the progress bar should be visible. */
    private _loading : boolean = false;

    /** Local reference to the subscription to the QueryService. */
    protected _queryServiceSubscription;

    /** Local reference to the ResultsContainer holding the query results. May be null. */
    private _results : ResultsContainer;

    /** Local reference to the subscription to the ResultsContainer. */
    private _resultsSubscriptionRef;

    /**
     * Default constructor.
     *
     * @param _cdr Reference to ChangeDetectorRef used to inform component about changes.
     * @param _queryService
     */
    constructor(protected _cdr: ChangeDetectorRef, protected _queryService : QueryService) {}

    /**
     * Lifecycle Hook (onInit): Subscribes to the QueryService observable.
     */
    public ngOnInit(): void {
        this._queryServiceSubscription = this._queryService.observable
            .filter(msg => ["STARTED", "ENDED", "ERROR", "CLEAR"].indexOf(msg) > -1)
            .subscribe((msg) => this.onQueryStateChange(msg));


        /* Apply results if there are existing. */
        if (this._queryService.results) this.register(this._queryService.results);

        /* Update view. */
        this.updateView();
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the QueryService and ResultsContainer subscription.
     */
    public ngOnDestroy() {
        this._queryServiceSubscription.unsubscribe();
        this._queryServiceSubscription = null;

        if (this._resultsSubscriptionRef) {
            this._resultsSubscriptionRef.unsubscribe();
            this._resultsSubscriptionRef = null;
        }
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
     * Getter for results.
     *
     * @return {ResultsContainer}
     */
    get results(): ResultsContainer {
        return this._results;
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
                this._results = this._queryService.results;
                this._results.subscribe(() => {this.updateView();});
                break;
            case 'ENDED':
            case 'ERROR':
                this._loading = false;
                break;
            case 'CLEAR':
                this._results = null;
                break;
        }

        this.updateView();
    }

    /**
     *
     * @param {ResultsContainer} results
     */
    protected register(results: ResultsContainer) {
        if (!results) throw new Error("The provided results are null or undefined; this is a programmers error!");

        /* Apply results */
        this._results = results;
        this._resultsSubscriptionRef = this._results.subscribe(() => {
            this.updateView();
        });
    }

    /**
     * This method is used internally to update the results view, i.e. re-populate the list
     * of items and re-render the component by marking it for change.
     */
    protected abstract updateView();
}