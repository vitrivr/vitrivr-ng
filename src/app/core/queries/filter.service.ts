import {Injectable} from '@angular/core';
import {MediaType, MediaTypes} from '../../shared/model/media/media-type.model';
import {MediaObjectScoreContainer} from '../../shared/model/results/scores/media-object-score-container.model';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {ColorLabel, ColorLabels} from '../../shared/model/misc/colorlabel.model';


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

    /**
     * A filter by metadata. For each metadata category (e.g. day), a list of allowed values is kept.
     * If empty, all results are displayed. If non-empty, only results are displayed where for every key in the filter, the metadata value of the object matches an allowed value in the list.
     * Behavior across categories is determined by a different boolean.
     * If the object does not have one of the metadata keys, it is filtered.
     */
    private _filterMetadata: Map<string, Set<string>> = new Map();

    /**
     * A filter by metadata for numeric values.
     * For each category, a min and max number is kept (or null)
     */
    private _filterRangeMetadata: Map<string, [number | null, number | null]> = new Map();

    /**
     * When set to true, objects who have metadata matching for any of the categories are displayed.
     */
    public _useOrForMetadataCategoriesFilter = false;

    /** Threshold for score filtering. */
    private _threshold = 0.0;

    /** An internal BehaviorSubject that publishes changes to the filters affecting MediaObjectScoreContainers. */
    private _objectFilters: BehaviorSubject<((v: MediaObjectScoreContainer) => boolean)[]> = new BehaviorSubject([]);

    /** An internal BehaviorSubject that publishes changes to the filters affecting SegmentScoreContainers. */
    private _segmentFilters: BehaviorSubject<((v: SegmentScoreContainer) => boolean)[]> = new BehaviorSubject([]);

    constructor() {
        MediaTypes.forEach(v => this._mediatypes.set(v, false));
        ColorLabels.forEach(v => this._dominant.set(v, false));
    }

    get threshold(): number {
        return this._threshold;
    }

    set threshold(value: number) {
        if (value >= 0.0 && value <= 1.0) {
            this._threshold = value;
        }
    }

    /**
     * Returns the list of Metadata that should be used for filtering.
     */
    get filterMetadata(): Map<string, Set<string>> {
        return this._filterMetadata
    }

    get filterRangeMetadata(): Map<string, [number | null, number | null]> {
        return this._filterRangeMetadata
    }

    /**
     * Returns the list of MediaTypes that should be used for filtering.
     */
    get mediatypes(): Map<MediaType, boolean> {
        return this._mediatypes;
    }

    /**
     * Returns the list of colors that should be used for filtering.
     */
    get dominant(): Map<ColorLabel, boolean> {
        return this._dominant;
    }

    /**
     * Returns a copy of the list of MediaTypes that should be used for filtering.
     */
    get mediatypeKeys(): MediaType[] {
        return Array.from(this._mediatypes.keys());
    }

    /**
     * Returns a copy of the list of colors that should be used for filtering.
     */
    get dominantKeys(): ColorLabel[] {
        return Array.from(this._dominant.keys());
    }

    /**
     * Getter for BehaviorSubject that publishes changes to the filters affecting MediaObjectScoreContainers.
     */
    get objectFilters(): Observable<((v: MediaObjectScoreContainer) => boolean)[]> {
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
        this._mediatypes.forEach((v, k) => this._mediatypes.set(k, false));
        this._dominant.forEach((v, k) => this._dominant.set(k, false));
        this._filterMetadata.clear();
        this._filterRangeMetadata.clear();
        this._threshold = 0.0;
        this.update()
    }


    public clearMetadata() {
        this._filterMetadata.clear();
        this._filterRangeMetadata.clear();
        this.update();
    }

    /**
     * Updates the filters according to the internal settings and publishes them through the respective observable.
     */
    public update() {
        /* Prepares the media object and media segment filters. */
        const objectFilters: ((v: MediaObjectScoreContainer) => boolean)[] = [];
        const segmentFilters: ((v: SegmentScoreContainer) => boolean)[] = [];

        // check if the given string a number and within the range-array
        // we have to be careful here because < and > return false if one of the args is NaN, undefined or null
        function checkRange(range, string): boolean {
            if (!string) {  // !NaN === true
                return false
            }
            const value = Number(string);
            // check if the value is even assignable.
            if (!value) {
                return false
            }
            if (range[0]) {
                if (value < range[0]) {
                    return false
                }
            }
            if (range[1]) {
                if (value > range[1]) {
                    return false
                }
            }
            return true
        }

        // of course, the AND filter can only be falsified by non-matching filter criteria while the OR filter can only be set to true if one of the conditions match
        // thus, the logic for all filters if the same
        objectFilters.push((obj) => {
            // this constructor avoids TS2367 giving an incorrect error when comparing andFilter to orFilter
            // this incorrect error is a feature ('working as intended')
            // see https://github.com/Microsoft/TypeScript/issues/25642
            let andFilter = Boolean(true);
            let orFilter = Boolean(false);
            this._filterMetadata.forEach((mdAllowedValuesSet, mdKey) => {
                // check if either one of the underlying segments or the object itself has appropriate metadata
                if (obj.segments.findIndex(seg => mdAllowedValuesSet.has(seg.metadata.get(mdKey))) >= 0 || mdAllowedValuesSet.has(obj.metadata.get(mdKey))) {
                    orFilter = true;
                    return;
                }
                andFilter = false;
            });
            this._filterRangeMetadata.forEach((range, mdKey) => {
                // check if one of the segments fulfills both range conditions
                if (obj.segments.findIndex(seg => checkRange(range, seg.metadata.get(mdKey))) >= 0) {
                    orFilter = true;
                    return;
                }
                // check if the object metadata fulfills the range condition
                if (checkRange(range, obj.metadata.get(mdKey))) {
                    orFilter = true;
                    return;
                }
                andFilter = false;
            });
            return this._useOrForMetadataCategoriesFilter ? orFilter : andFilter;
        });
        segmentFilters.push((seg) => {
            let andFilter = Boolean(true);
            let orFilter = Boolean(false);
            // check whether the segment or the corresponding object has appropriate metadata
            this._filterMetadata.forEach((mdAllowedValuesSet, mdKey) => {
                if (mdAllowedValuesSet.has(seg.metadata.get(mdKey)) || mdAllowedValuesSet.has(seg.objectScoreContainer.metadata.get(mdKey))) {
                    orFilter = true;
                    return;
                }
                andFilter = false;
            });
            this._filterRangeMetadata.forEach((range, mdKey) => {
                if (checkRange(range, seg.metadata.get(mdKey)) || checkRange(range, seg.objectScoreContainer.metadata.get(mdKey))) {
                    orFilter = true;
                    return;
                }
                andFilter = false;
            });
            return this._useOrForMetadataCategoriesFilter ? orFilter : andFilter;
        });

        if (!this.mediatypeKeys.every(v => this._mediatypes.get(v) === false)) {
            objectFilters.push((obj) => this._mediatypes.get(obj.mediatype) === true);
            segmentFilters.push((seg) => this._mediatypes.get(seg.objectScoreContainer.mediatype) === true);
        }

        if (!this.dominantKeys.every(v => this._dominant.get(v) === false)) {
            segmentFilters.push((seg) => seg.metadata.has('dominantcolor.color') && this._dominant.get(<ColorLabel>seg.metadata.get('dominantcolor.color').toUpperCase()) === true);
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
