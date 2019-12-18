/**
 * Interface for a Similarity type. Used to map JSON responses to object-representations.
 */
export interface Similarity {
  value: number,
  key: string,
  /**
   * @deprecated Replaced by containerId on similarityresult object
   */
  extra?: string
}
