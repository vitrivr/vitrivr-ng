import {MediaObjectDescriptor} from "../../../../../openapi/cineast";
import {ColorLabel} from "../../../shared/model/misc/colorlabel.model";
import {Tag} from "../../selection/tag.model";

/**
 * A simple data class for logging
 */
export class FilterInformation {

  /**
   * When set to true, objects who have metadata matching for any of the categories are displayed.
   */
  useOrForMetadataCategoriesFilter = false;

  id: string;

  /**
   * A filter by MediaType. Affects both MediaObjectScoreContainers and MediaSegmentScoreContainers. If non-empty, only objects
   * that match one of the MediaTypes contained in this array will pass the filter.
   */
  mediatypes: Map<MediaObjectDescriptor.MediatypeEnum, boolean> = new Map();

  /**
   * A filter by dominant color. Affects only MediaSegmentScoreContainers. If non-empty, only segments
   * that match at least one of the dominant colors contained in this array will pass the filter.
   */
  dominant: Map<ColorLabel, boolean> = new Map();

  /**
   * A filter by metadata. For each metadata category (e.g. day), a list of allowed values is kept.
   * If empty, all results are displayed. If non-empty, only results are displayed where for every key in the filter, the metadata value of the object matches an allowed value in the list.
   * Behavior across categories is determined by a different boolean.
   * If the object does not have one of the metadata keys, it is filtered.
   */
  filterMetadata: Map<string, Set<string>> = new Map();

  /**
   * A filter for tags. This is the list of allowed tag names. If the set is empty, no filter is applied.
   */
  filterTags: Set<Tag> = new Set();

  /**
   * A filter by metadata for numeric values.
   * For each category, a min and max number is kept (or null)
   */
  filterRangeMetadata: Map<string, [number | null, number | null]> = new Map();

  /** Threshold for score filtering. */
  threshold = 0.0;
}