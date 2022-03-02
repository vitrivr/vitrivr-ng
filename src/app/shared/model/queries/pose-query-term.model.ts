import {AbstractQueryTerm} from "./abstract-query-term.model";
import {QueryTerm} from "../../../../../openapi/cineast";

export class PoseQueryTerm extends AbstractQueryTerm {
  constructor() {
    super(QueryTerm.TypeEnum.POSE, ['poseestimate'])
  }
}
