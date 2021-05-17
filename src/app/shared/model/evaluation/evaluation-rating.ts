/**
 * Represents a single rating for a result returned by Cineast.
 */
export class EvaluationRating {
  /** The relevance per feature category. */
  private _per_category_relevance: { [key: string]: number; };

  /** ID of the rated multimedia object. */
  private _objectId: String;

  /** ID of the rated multimedia segment. */
  private readonly _segmentId: String;

  /** Rank of the item in the list of results (zero based). */
  private readonly _rank;

  /** The relevance of the item as determined by Cineast. */
  private readonly _relevance: number;

  /** User rating between 0 and 3. Defaults to -1, which is equal to not rated. */
  private _rating = -1;

  /**
   * Creates and returns a compact object representation of the EvaluationSet (no
   * type). This representation can be used for serialisation.
   *
   * @param rating EvaluationRating that should be serialised
   * @return {{segmentId: string, template: string, evaluations: Array}}
   */
  public static serialise(rating: EvaluationRating): any {
    return {
      objectId: rating._objectId,
      segmentId: rating._segmentId,
      rank: rating._rank,
      relevance: rating._relevance,
      per_category_relevance: rating._per_category_relevance,
      rating: rating._rating
    };
  }

  /**
   * Deserialises an EvaluationRating from a plain JavaScript object. The field-names in the object must
   * correspond to the field names of the EvaluationSet, without the _ prefix.
   */
  public static deserialise(object: any): EvaluationRating {
    const rating = new EvaluationRating(object['objectId'], object['segmentId'], object['rank'], object['relevance'], object['per_category_relevance']);
    rating._rating = object['rating'];
    return rating;
  }

  constructor(objectId: String, segmentId: String, rank: number, relevance: number, per_category_relevance: { [key: string]: number; }) {
    this._objectId = objectId;
    this._segmentId = segmentId;
    this._rank = rank;
    this._relevance = relevance;
    this._per_category_relevance = per_category_relevance;
  }

  get objectId() {
    return this._segmentId;
  }

  get segmentId() {
    return this._segmentId;
  }

  get rank() {
    return this._rank;
  }

  get relevance() {
    return this._relevance;
  }

  get rating() {
    return this._rating;
  }

  set rating(value) {
    if (value >= 0 && value <= 3) {
      this._rating = value;
    }
  }
}
