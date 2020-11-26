/**
 * Defines the general structure of the result which specifies all tagids assigned to a specific element.
 */
export interface TagIDsElementResultInterface {

  /** id for the request*/
  queryId: string;

  /** All tag ids for the given segment. Match ids to their actual tags using the TagsLookupService. */
  tagIDs: string[];

  /** ID for which features were requested */
  elementID: string;
}
