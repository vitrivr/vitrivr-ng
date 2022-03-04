import {AbstractQueryTerm} from "./abstract-query-term.model";
import {QueryTerm} from "../../../../../openapi/cineast";

export class SkeletonPoseQueryTerm extends AbstractQueryTerm {
  constructor() {
    super(QueryTerm.TypeEnum.SKELETON, ['skeletonpose'])
  }
}
