import {FilterInformation} from "./filter-information";
import {SegmentScoreLogContainer} from "./segment-score-log-container";

export interface ResultLogItem {
  filter: FilterInformation
  query: any,
  results: SegmentScoreLogContainer[],
}