export class EvaluationRating {

    private _id: String;

    private _rank;

    private _relevance: number;

    /* Rating between 0 and 3. Defaults to -1, which is equal to not rated. */
    private _rating = -1;

    /**
     *
     * @param id
     * @param rank
     * @param relevance
     */
    constructor(id : String, rank: number, relevance: number) {
        this._id = id;
        this._rank = rank;
        this._relevance = relevance;
    }

    /**
     * Getter for ID.
     *
     * @return {String}
     */
    get id() {
        return this._id;
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
     * @return {{id: string, template: string, evaluations: Array}}
     */
    public static serialise(rating: EvaluationRating) : any {
        return {
            id : rating._id,
            rank : rating._rank,
            relevance : rating._relevance,
            rating : rating._rating
        };
    }

    /**
     *
     * @param object
     * @return {EvaluationRating}
     */
    public static deserialise(object: any) : EvaluationRating {
        let rating = new EvaluationRating(object["id"], object["rank"], object["relevance"]);
        rating._rating = object["rating"];
        return rating;
    }
}