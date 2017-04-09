export class EvaluationRating {
    /* Rating between 0 and 3. Defaults to -1, which is equal to not rated. */
    private _rating = -1;

    /* Default constructor. */
    constructor(public readonly id: String, public readonly rank: number, public relevance: number) {}


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
}