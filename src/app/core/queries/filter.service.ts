import {Injectable} from "@angular/core";
import {MediaType} from "../../shared/model/media/media-type.model";
import {MediaObjectScoreContainer} from "../../shared/model/results/scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../../shared/model/results/scores/segment-score-container.model";
import {BehaviorSubject, Observable} from "rxjs";


/**
 * This service is used to define client-side filters. It offers an easy-to-use interface for defining different types of filters
 * that affect either MediaObjectScoreContainers OR MediaSegmentScoreContainers and a way for components (such as results lists) to
 * be notified about changes in filters.
 */
@Injectable()
export class FilterService {
    /**
     * A filter by MediaType. Affects both MediaObjectScoreContainers and MediaSegmentScoreContainers. If non-empty, only objects
     * that match one of the MediaTypes contained in this array will pass the filter.
     */
    private _mediatypes: MediaType[] = [];

    /**
     * A filter by dominant color. Affects only MediaSegmentScoreContainers. If non-empty, only segments
     * that match at least one of the dominant colors contained in this array will pass the filter.
     */
    private _dominant: string[] = [];

    /** An internal BehaviorSubject that publishes changes to the filters affecting MediaObjectScoreContainers. */
    private _objectFilters: BehaviorSubject<((v: MediaObjectScoreContainer) => boolean)[]> = new BehaviorSubject([]);

    /** An internal BehaviorSubject that publishes changes to the filters affecting SegmentScoreContainers. */
    private _segmentFilters: BehaviorSubject<((v: SegmentScoreContainer) => boolean)[]> = new BehaviorSubject([]);

    /**
     *
     * @param _query
     */
    constructor() {}

    /**
     * Returns a copy of the list of MediaTypes that should be used for filtering.
     */
    get mediatypes() : MediaType[] {
        return this._mediatypes.slice();
    }

    /**
     * Returns a copy of the list of colors that should be used for filtering.
     */
    get dominant() : string[] {
        return this._dominant.slice();
    }

    /**
     * Getter for BehaviorSubject that publishes changes to the filters affecting MediaObjectScoreContainers.
     */
    get objectFilters(): Observable<((v: MediaObjectScoreContainer) => boolean)[]>  {
        return this._objectFilters.asObservable();
    }

    /**
     * Getter for BehaviorSubject that publishes changes to the filters affecting SegmentScoreContainer.
     */
    get segmentFilter(): Observable<((v: SegmentScoreContainer) => boolean)[]> {
        return this._segmentFilters.asObservable();
    }

    /**
     * Adds one or many MediaType filter terms.
     *
     * @param types MediaType filter terms to add.
     */
    public addMediaType(...types: MediaType[]) {
        let change = false;
        types.forEach(v => {
            if (this._mediatypes.indexOf(v) == -1) {
                this._mediatypes.push(v);
                change = true;
            }
        });
        if (change) this.update();
    }

    /**
     * Removes one or many MediaType filter terms.
     *
     * @param types MediaType filter terms to remove.
     */
    public removeMediaType(...types: MediaType[]) {
        let change = false;
        types.forEach(v => {
            let index = this._mediatypes.indexOf(v);
            if (index > -1) {
                this._mediatypes.splice(index, 1);
                change = true;
            }
        });
        if (change) this.update();
    }

    /**
     * Adds one or many dominant color filter terms.
     *
     * @param colors Dominant color filter terms to add.
     */
    public addDominantColor(...colors: string[]) {
        let change = false;
        colors.forEach(v => {
            if (this._dominant.indexOf(v) == -1) {
                this._dominant.push(v);
                change = true;
            }
        });
        if (change) this.update();
    }

    /**
     * Removes one or many dominant color filter terms.
     *
     * @param colors Dominant color filter terms to remove.
     */
    public removeDominantColor(...colors: string[]) {
        let change = false;
        colors.forEach(v => {
            let index = this._dominant.indexOf(v);
            if (index > -1) {
                this._dominant.splice(index, 1);
                change = true;
            }
        });
        if (change) this.update();
    }

    /**
     * Clears all filters. Causes an update to be published.
     */
    public clear() {
        this._mediatypes.length = 0;
        this._dominant.length = 0;
        this.update()
    }

    /**
     * Updates the filters according to the internal settings and publishes them through the respective observable.
     */
    private update() {
        /* Prepares the media object filters. */
        let objectFilters: ((v: MediaObjectScoreContainer) => boolean)[]  = [];
        if (this._mediatypes.length > 0) objectFilters.push((v) => this._mediatypes.indexOf(v.mediatype) == -1);

        /* Prepare the media segment filters. */
        let segmentFilters: ((v: SegmentScoreContainer) => boolean)[]  = [];
        if (this._mediatypes.length > 0) segmentFilters.push((v) => this._mediatypes.indexOf(v.objectScoreContainer.mediatype) == -1);
        if (this._dominant.length > 0) segmentFilters.push((v) => v.metadata.has("color.dominant") && this._dominant.indexOf(v.metadata.get("color.dominant")) == -1);

        /* Publish changes. */
        this._objectFilters.next(objectFilters);
        this._segmentFilters.next(segmentFilters);
    }
}