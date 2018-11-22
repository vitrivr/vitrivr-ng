import {ResultsContainer} from "../results/scores/results-container.model";

export class HistoryContainer {

    /** The serialized contained in this HistoryContainer. */
    public readonly results;

    /** Timestamp of the HistoryContainer. */
    public readonly timestamp;

    /** Number of object in this HistoryContainer. */
    public readonly objects;

    /** Number of segments in this HistoryContainer. */
    public readonly segments;

    /**
     * Constructor for ResultsContainer.
     *
     * @param results
     */
    constructor(results: ResultsContainer) {
        if (!results) throw new Error("Cannot create HistoryContainerModel without ResultsContainer.");
        this.timestamp = Date.now();
        this.objects = results.objectCount;
        this.segments = results.segmentCount;
        this.results = results.serialize();
    }
}