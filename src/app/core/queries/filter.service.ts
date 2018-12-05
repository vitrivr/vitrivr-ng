import {Injectable} from "@angular/core";
import {MediaType, MediaTypes} from "../../shared/model/media/media-type.model";
import {MediaObjectScoreContainer} from "../../shared/model/results/scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../../shared/model/results/scores/segment-score-container.model";
import {BehaviorSubject, Observable} from "rxjs";
import {ColorLabel, ColorLabels} from "../../shared/model/misc/colorlabel.model";


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
    private _mediatypes: Map<MediaType, boolean> = new Map();

    /**
     * A filter by dominant color. Affects only MediaSegmentScoreContainers. If non-empty, only segments
     * that match at least one of the dominant colors contained in this array will pass the filter.
     */
    private _dominant: Map<ColorLabel, boolean> = new Map();

    /** Threshold for score filtering. */
    private _threshold: number = 0.0;

    /** An internal BehaviorSubject that publishes changes to the filters affecting MediaObjectScoreContainers. */
    private _objectFilters: BehaviorSubject<((v: MediaObjectScoreContainer) => boolean)[]> = new BehaviorSubject([]);

    /** An internal BehaviorSubject that publishes changes to the filters affecting SegmentScoreContainers. */
    private _segmentFilters: BehaviorSubject<((v: SegmentScoreContainer) => boolean)[]> = new BehaviorSubject([]);

    /**
     *
     * @param _query
     */
    constructor() {
        MediaTypes.forEach(v => this._mediatypes.set(v, false));
        ColorLabels.forEach(v => this._dominant.set(v, false));
    }

    /**
     *
     */
    get threshold(): number {
        return this._threshold;
    }

    /**
     *
     * @param value
     */
    set threshold(value: number) {
        if (value >= 0.0 && value <= 1.0) {
            this._threshold = value;
        }
    }

    /**
     * Returns a copy of the list of MediaTypes that should be used for filtering.
     */
    get mediatypes() : Map<MediaType, boolean> {
        return this._mediatypes;
    }

    /**
     * Returns a copy of the list of colors that should be used for filtering.
     */
    get dominant() :  Map<ColorLabel, boolean> {
        return this._dominant;
    }

    /**
     * Returns a copy of the list of MediaTypes that should be used for filtering.
     */
    get mediatypeKeys() : MediaType[] {
        return Array.from(this._mediatypes.keys());
    }

    /**
     * Returns a copy of the list of colors that should be used for filtering.
     */
    get dominantKeys() :  ColorLabel[] {
        return Array.from(this._dominant.keys());
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
     * Clears all filters. Causes an update to be published.
     */
    public clear() {
        this._mediatypes.forEach(v => v[1] = true);
        this._dominant.forEach(v => v[1] = true);
        this.update()
    }

    /**
     * Updates the filters according to the internal settings and publishes them through the respective observable.
     */
    public update() {
        /* Prepares the media object and media segment filters. */
        let objectFilters: ((v: MediaObjectScoreContainer) => boolean)[]  = [];
        let segmentFilters: ((v: SegmentScoreContainer) => boolean)[]  = [];

        if (!this.mediatypeKeys.every(v => this._mediatypes.get(v) == false)) {
            objectFilters.push((obj) => this._mediatypes.get(obj.mediatype) == true);
            segmentFilters.push((seg) => this._mediatypes.get(seg.objectScoreContainer.mediatype) == true);
        }

        if (!this.dominantKeys.every(v => this._dominant.get(v) == false)) {
            segmentFilters.push((seg) => seg.metadata.has("dominantcolor.color") && this._dominant.get(<ColorLabel>seg.metadata.get("dominantcolor.color").toUpperCase()) == true);
        }

        /* Filter for score threshold. */
        if (this.threshold > 0) {
            objectFilters.push((obj) => obj.score > this.threshold);
            segmentFilters.push((seg) => seg.score > this.threshold);
        }

        /* Publish changes. */
        this._objectFilters.next(objectFilters);
        this._segmentFilters.next(segmentFilters);
    }
}