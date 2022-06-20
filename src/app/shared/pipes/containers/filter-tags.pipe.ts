import {Pipe, PipeTransform} from '@angular/core';
import {Tag} from '../../../core/selection/tag.model';
import {MediaSegmentScoreContainer} from '../../model/results/scores/segment-score-container.model';

@Pipe({
  name: 'FilterTagsPipe'
})
/**
 * Used in the mini-gallery view to filter segments which are not tagged
 */
export class FilterTagsPipe implements PipeTransform {

  public transform(array: Array<MediaSegmentScoreContainer>, tags: Map<string, Tag[]> | null, filterTags: Set<Tag>): Array<MediaSegmentScoreContainer> {
    if (!array || array.length === 0) {
      return [];
    }
    if (!tags) {
      return array;
    }
    if (filterTags.size === 0) {
      return array;
    }
    /* Set has no map()... https://stackoverflow.com/questions/33234666/how-to-map-reduce-filter-a-set-in-javascript*/
    const filterArray = Array.from(filterTags);
    return array.filter(e =>
        /* For all tag the user desires... */
        filterArray.map(filterTag => {
          /* we check that (i) the segment we're currently looking at has any tags and
  (ii) that the list of actived tags for this segment contains the tag the user desires */
          //tags.has(e.segmentId) && tags.get(e.segmentId).has(t))
          if (tags.has(e.segmentId)) {
            console.log(tags.get(e.segmentId))
            if (tags.get(e.segmentId).find(t => t.name == filterTag.name)) {
              return true
            }
          }
          return false
        }).indexOf(false) < 0 /* check that for each tag, the condition is true */
    );
  }
}
