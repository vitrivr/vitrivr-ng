import {ResultsContainer} from '../results/scores/results-container.model';

export class HistoryContainer {
  /** ID of the HistoryContainer (set by the database). */
  public id: number;

  /** The serialized contained in this HistoryContainer. */
  public readonly results;

  /** Timestamp of the HistoryContainer. */
  public readonly timestamp;

  /** Number of object in this HistoryContainer. */
  public readonly objects;

  /** Number of segments in this HistoryContainer. */
  public readonly segments;

  /** List of features used for this HistoryContainer. */
  public readonly features;

  /**
   * Constructor for ResultsContainer.
   *
   * @param results
   */
  constructor(results: ResultsContainer) {
    if (!results) {
      throw new Error('Cannot create HistoryContainerModel without ResultsContainer.');
    }
    this.timestamp = Date.now();
    this.objects = results.objectCount;
    this.segments = results.segmentCount;
    this.features = results.features.map(f => f.name);
    this.results = results.serialize();
  }
}
