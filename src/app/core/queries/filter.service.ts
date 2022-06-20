import {Injectable} from '@angular/core';
import {MediaObjectScoreContainer} from '../../shared/model/results/scores/media-object-score-container.model';
import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {BehaviorSubject} from 'rxjs';
import {ColorLabel, ColorLabels} from '../../shared/model/misc/colorlabel.model';
import {SelectionService} from '../selection/selection.service';
import {Tag} from '../selection/tag.model';
import {MediaObjectDescriptor} from '../../../../openapi/cineast';
import {FilterInformation} from "../competition/logging/filter-information";


/**
 * This service is used to define client-side filters. It offers an easy-to-use interface for defining different types of filters
 * that affect either MediaObjectScoreContainers OR MediaSegmentScoreContainers and a way for components (such as results lists) to
 * be notified about changes in filters.
 */
@Injectable()
export class FilterService {

  /** A BehaviorSubject that publishes changes to the filters affecting SegmentScoreContainers. */
  _segmentFilters: BehaviorSubject<((v: MediaSegmentScoreContainer) => boolean)[]> = new BehaviorSubject([]);

  /** A BehaviorSubject that publishes changes to the filters affecting MediaObjectScoreContainers. */
  _objectFilters: BehaviorSubject<((v: MediaObjectScoreContainer) => boolean)[]> = new BehaviorSubject([]);

  _filters: FilterInformation = new FilterInformation();

  filterSubject: BehaviorSubject<FilterInformation> = new BehaviorSubject(this._filters);


  constructor(private _selectionService: SelectionService) {
    Object.keys(MediaObjectDescriptor.MediatypeEnum).map(key => MediaObjectDescriptor.MediatypeEnum[key]).forEach(v => this._filters.mediatypes.set(v, false));
    ColorLabels.forEach(v => this._filters.dominant.set(v, false));
  }

  /**
   * Returns an editable map of the mediatypes that should be used for filtering
   */
  get mediatypes(): Map<MediaObjectDescriptor.MediatypeEnum, boolean> {
    return this._filters.mediatypes;
  }

  /**
   * Returns an editable map of the colorlabels that should be used for filtering
   */
  get dominant(): Map<ColorLabel, boolean> {
    return this._filters.dominant;
  }

  /**
   * Returns an editable map of the metadata that should be used for filtering
   */
  get filterMetadata(): Map<string, Set<string>> {
    return this._filters.filterMetadata
  }

  /**
   * Returns the editable set of tags used for filtering
   */
  get filterTags(): Set<Tag> {
    return this._filters.filterTags;
  }

  /**
   * Returns an editable map of the metadata that should be used for filtering with ranges
   */
  get filterRangeMetadata(): Map<string, [number | null, number | null]> {
    return this._filters.filterRangeMetadata
  }

  get threshold(): number {
    return this._filters.threshold;
  }

  set threshold(value: number) {
    if (value >= 0.0 && value <= 1.0) {
      this._filters.threshold = value;
    }
  }

  /**
   * Returns a copy of the list of MediaTypes that should be used for filtering.
   */
  get mediatypeKeys(): MediaObjectDescriptor.MediatypeEnum[] {
    return Array.from(this._filters.mediatypes.keys());
  }

  /**
   * Returns a copy of the list of colors that should be used for filtering.
   */
  get dominantKeys(): ColorLabel[] {
    return Array.from(this._filters.dominant.keys());
  }

  /**
   * Clears all filters. Causes an update to be published.
   */
  public clear() {
    this._filters.mediatypes.forEach((v, k) => this._filters.mediatypes.set(k, false));
    this._filters.dominant.forEach((v, k) => this._filters.dominant.set(k, false));
    this._filters.filterMetadata.clear();
    this._filters.filterRangeMetadata.clear();
    this._filters.filterTags.clear();
    this._filters.threshold = 0.0;
    this._filters.id = null
    this.update()
  }


  /**
   * Clear metadata filters. Causes an update to be published
   */
  public clearMetadata() {
    this._filters.filterMetadata.clear();
    this._filters.filterRangeMetadata.clear();
    this.update();
  }

  /**
   * Updates the filters according to the internal settings and publishes them through the respective observable.
   */
  public update() {
    /* Prepares the media object and media segment filters. */
    const objectFilters: ((v: MediaObjectScoreContainer) => boolean)[] = [];
    const segmentFilters: ((v: MediaSegmentScoreContainer) => boolean)[] = [];

    if (this._filters.id) {
      objectFilters.push((o) => o.objectid === this._filters.id)
      segmentFilters.push((s) => s.objectId === this._filters.id || s.segmentId === this._filters.id)
    }

    /* Inline function for range metadata filters
     * check if the given string is a number and within the range-array
     * we have to be careful here because < and > return false if one of the args is NaN, undefined or null
     */
    function checkRange(range, string): boolean {
      if (!string) {  // !NaN === true
        /* If the value is not available, do not show the object */
        return false
      }
      const value = Number(string);
      if (!value) {
        /* if the value is not a string, do not show the object */
        return false
      }
      /* If a lower bound is set, check if the value is smaller than that */
      if (range[0]) {
        if (value < range[0]) {
          return false
        }
      }
      /* If an upper bound is set, check if the value is larger than that */
      if (range[1]) {
        if (value > range[1]) {
          return false
        }
      }
      /* If we're here, the value is valid and the corresponding segment can be displayed */
      return true
    }

    if (!(this._filters.filterMetadata.size === 0 && this._filters.filterRangeMetadata.size === 0 && this._filters.filterTags.size === 0)) {
      console.debug(`updating filters`);

      // of course, the AND filter can only be falsified by non-matching filter criteria while the OR filter can only be set to true if one of the conditions match
      // thus, the logic for all filters if the same
      objectFilters.push((obj) => {
        // this constructor avoids TS2367 giving an incorrect error when comparing andFilter to orFilter
        // this incorrect error is a feature ('working as intended')
        // see https://github.com/Microsoft/TypeScript/issues/25642
        let andFilter = Boolean(true);
        let orFilter = Boolean(false);
        let tagFilter = Boolean(false);
        this._filters.filterMetadata.forEach((mdAllowedValuesSet, mdKey) => {
          // check if either one of the underlying segments or the object itself has appropriate metadata
          if (obj.segments.findIndex(seg => mdAllowedValuesSet.has(seg.metadata.get(mdKey))) >= 0 || mdAllowedValuesSet.has(obj._metadata.get(mdKey))) {
            orFilter = true;
            return;
          }
          andFilter = false;
        });
        this._filters.filterRangeMetadata.forEach((range, mdKey) => {
          // check if one of the segments fulfills both range conditions
          if (obj.segments.findIndex(seg => checkRange(range, seg.metadata.get(mdKey))) >= 0) {
            orFilter = true;
            return;
          }
          // check if the object metadata fulfills the range condition
          if (checkRange(range, obj._metadata.get(mdKey))) {
            orFilter = true;
            return;
          }
          andFilter = false;
        });
        if (this._filters.filterTags.size === 0) {
          tagFilter = true;
        }
        this._filters.filterTags.forEach(tag => {
          if (obj.segments.findIndex(seg => this._selectionService.hasTag(seg.segmentId, tag)) >= 0) {
            tagFilter = true;
          }
        });
        return this._filters.useOrForMetadataCategoriesFilter ? orFilter && tagFilter : andFilter && tagFilter;
      });

      segmentFilters.push((seg) => {
        let andFilter = Boolean(true);
        let orFilter = Boolean(false);
        // check whether the segment or the corresponding object has appropriate metadata
        this._filters.filterMetadata.forEach((mdAllowedValuesSet, mdKey) => {
          if (mdAllowedValuesSet.has(seg.metadata.get(mdKey)) || mdAllowedValuesSet.has(seg.objectScoreContainer._metadata.get(mdKey))) {
            orFilter = true;
            return;
          }
          andFilter = false;
        });
        this._filters.filterRangeMetadata.forEach((range, mdKey) => {
          if (checkRange(range, seg.metadata.get(mdKey)) || checkRange(range, seg.objectScoreContainer._metadata.get(mdKey))) {
            orFilter = true;
            return;
          }
          andFilter = false;
        });
        return this._filters.useOrForMetadataCategoriesFilter ? orFilter : andFilter;
      });
    }

    if (!this.mediatypeKeys.every(v => this._filters.mediatypes.get(v) === false)) {
      objectFilters.push((obj) => this._filters.mediatypes.get(obj.mediatype) === true);
      segmentFilters.push((seg) => this._filters.mediatypes.get(seg.objectScoreContainer.mediatype) === true);
    }

    if (!this.dominantKeys.every(v => this._filters.dominant.get(v) === false)) {
      segmentFilters.push((seg) => seg.metadata.has('dominantcolor.color') && this._filters.dominant.get(<ColorLabel>seg.metadata.get('dominantcolor.color').toUpperCase()) === true);
    }

    /* Filter for score threshold. */
    if (this.threshold > 0) {
      objectFilters.push((obj) => obj.score > this.threshold);
      segmentFilters.push((seg) => seg.score > this.threshold);
    }

    /* Publish changes. */
    this._objectFilters.next(objectFilters);
    this._segmentFilters.next(segmentFilters);
    this.filterSubject.next(this._filters)
  }
}
