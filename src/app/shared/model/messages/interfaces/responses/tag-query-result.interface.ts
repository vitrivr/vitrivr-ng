import {Tag} from '../../../misc/tag.model';

export interface TagQueryResult {
  queryId: string;
  tags: Tag[];
}
