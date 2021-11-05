import {NgModule} from '@angular/core';
import {OrderBySegmentPipe} from './containers/order-by-segment.pipe';
import {OrderByScorePipe} from './containers/order-by-score.pipe';
import {FilterPipe} from './containers/filter.pipe';
import {LimitPipe} from './containers/limit.pipe';
import {ArrayObjectSortPipe} from './containers/array-object-sort.pipe';
import {SetStringSortPipe} from './containers/set-string-sort.pipe';
import {FlattenPathsPipe} from './paths/flatten-paths.pipe';
import {LimitObjectsPipe} from './containers/limit-objects.pipe';
import {OrderBySegmentIdPipe} from './containers/order-by-segment-id.pipe';
import {OrderByPipe} from './containers/order-by.pipe';
import {LimitPathsPipe} from './containers/limit-paths.pipe';
import {DresEnabledPipe} from './preferences/dres-enabled.pipe';
import {GetConfigVariablePipe} from './preferences/get-config-variable.pipe';
import {ObjectFilterTemporalPipe} from './util/object-filter-temporal.pipe';
import {ThumbnailPathPipe} from './paths/thumbnail-path.pipe';
import {ObjectPathPipe} from './paths/object-path.pipe';
import {IiifResourceUrlPipe} from './paths/iiif-resource-url.pipe';
import {SegmentPathPipe} from './paths/segment-path.pipe';
import {CompetitionEnabledPipe} from './util/competition-enabled.pipe';
import {ColorForRelevancePipe} from './util/color-for-relevance-pipe';
import {TextWithLinkPipe} from './util/text-with-link.pipe';
import {SortTagsPipe} from './util/sort-tags.pipe';
import {ScorePercentagePipe} from './containers/score-percentage.pipe';
import {BackgroundScorePipe} from './util/background-score.pipe';
import {QueryStageIndexPipe} from './query/query-stage-index.pipe';
import {QueryStageLast} from './query/query-stage-last.pipe';

@NgModule({
  imports: [],
  // tslint:disable-next-line:max-line-length
  declarations: [QueryStageLast, QueryStageIndexPipe, BackgroundScorePipe, ScorePercentagePipe, SortTagsPipe, TextWithLinkPipe, ColorForRelevancePipe, CompetitionEnabledPipe, SegmentPathPipe, IiifResourceUrlPipe, ObjectPathPipe, ThumbnailPathPipe, ObjectFilterTemporalPipe, GetConfigVariablePipe, DresEnabledPipe, OrderBySegmentPipe, FlattenPathsPipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe, LimitObjectsPipe, LimitPathsPipe, OrderBySegmentIdPipe, OrderByPipe],
  // tslint:disable-next-line:max-line-length
  exports: [QueryStageLast, QueryStageIndexPipe, BackgroundScorePipe, ScorePercentagePipe, SortTagsPipe, TextWithLinkPipe, ColorForRelevancePipe, CompetitionEnabledPipe, SegmentPathPipe, IiifResourceUrlPipe, ObjectPathPipe, ThumbnailPathPipe, ObjectFilterTemporalPipe, GetConfigVariablePipe, DresEnabledPipe, OrderBySegmentPipe, FlattenPathsPipe, OrderByScorePipe, FilterPipe, LimitPipe, ArrayObjectSortPipe, SetStringSortPipe, LimitObjectsPipe, LimitPathsPipe, OrderBySegmentIdPipe, OrderByPipe]
})
export class PipesModule {
}
