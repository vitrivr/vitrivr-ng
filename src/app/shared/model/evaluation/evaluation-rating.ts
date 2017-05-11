/**
 * Represents a single rating for a result returned by Cineast.
 */
export class EvaluationRating {
    /** ID of the rated multimedia object. */
    private _objectId: String;

    /** ID of the rated multimedia segment. */
    private _segmentId: String;

    /** Rank of the item in the list of results (zero based). */
    private _rank;

    /** The relevance of the item as determined by Cineast. */
    private _relevance: number;

    /** User rating between 0 and 3. Defaults to -1, which is equal to not rated. */
    private _rating = -1;

    /**
     * Default constructor of EvaluationRating
     *
     * @param objectId
     * @param segmentId
     * @param rank
     * @param relevance
     */
    constructor(objectId : String, segmentId: String, rank: number, relevance: number) {
        this._objectId = objectId;
        this._segmentId = segmentId;
        this._rank = rank;
        this._relevance = relevance;
    }

    /**
     * Getter for object ID.
     *
     * @return {String}
     */
    get objectId() {
        return this._segmentId;
    }

    /**
     * Getter for segment ID.
     *
     * @return {String}
     */
    get segmentId() {
        return this._segmentId;
    }

    /**
     * Getter for rank.
     *
     * @return {number}
     */
    get rank() {
        return this._rank;
    }

    /**
     * Getter for relevance.
     *
     * @return {number}
     */
    get relevance() {
        return this._relevance;
    }

    /**
     * Getter for rating.
     *
     * @returns {any}
     */
    get rating() {
        return this._rating;
    }

    /**
     * Setter for rating.
     * @param value
     */
    set rating(value) {
        if (value >= 0 && value <= 3) {
            this._rating = value;
        }
    }

    /**
     * Creates and returns a compact object representation of the EvaluationSet (no
     * type). This representation can be used for serialisation.
     *
     * @param rating EvaluationRating that should be serialised
     * @return {{segmentId: string, template: string, evaluations: Array}}
     */
    public static serialise(rating: EvaluationRating) : any {
        return {
            objectId : rating._objectId,
            segmentId : rating._segmentId,
            rank : rating._rank,
            relevance : rating._relevance,
            rating : rating._rating
        };
    }

    /**
     * Deserialises an EvaluationRating from a plain JavaScript object. The field-names in the object must
     * correspond to the field names of the EvaluationSet, without the _ prefix.
     *
     * @param object
     * @return {EvaluationRating}
     */
    public static deserialise(object: any) : EvaluationRating {
        let rating = new EvaluationRating(object["objectId"],object["segmentId"], object["rank"], object["relevance"]);
        rating._rating = object["rating"];
        return rating;
    }
}