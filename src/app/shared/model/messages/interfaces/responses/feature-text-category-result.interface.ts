/**
 * Defines the general structure of the result for all features for a text category.
 */
export interface FeaturesTextCategoryCategoryResult {

  /** id for the request*/
  queryId: string;

  /** All feature values for the request (e.g. for ocr 'hello', 'world')*/
  featureValues: string[];

  /** category that was requested (e.g. 'ocr'). Possible categories depend on your cineast configuration*/
  category: string;

  /** ID for which features were requested */
  elementID: string;
}
