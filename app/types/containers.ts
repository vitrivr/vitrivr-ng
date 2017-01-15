import {Similarity, MediaObject, MediaSegment} from "./media.types";

/**
 * This class defines an abstract container for compound scores, i.e. scores that are obtained as a result of multiple
 * sub-scores. It defines some basic methods that can be invoked for such a CompoundScoreContainer.
 *
 * Note: The class is used to build a ScoreContainer hierarchy for query-results returned by Cineast. For every MediaObject
 * (e.g. a video) a MediaObjectScoreContainer is created. That container in turn hosts a list of SegmentScoreContainer's,
 * which again host a set of Similarity objects (raw scores).
 *
 * Both containers are able to derive a score for themselves based on the sub-entities they host. These scores are used
 * to rank the query-results in the UI.
 */
export abstract class CompoundScoreContainer {
    /** Score value. How it is obtained is up to the implementing class. */
    protected score : number = 0;

    /**
     * Adds a Similarity object to the CompoundScoreContainer. Usually, that object is somehow used to influence,
     * change the score of the Container.
     *
     * @param category Category for which to add the similarity value.
     * @param similarity Similarity value
     */
    public abstract addSimilarity(category : string, similarity : Similarity) : void;


    /**
     * Can be used to update the score given a list of of weights. The weight are used to
     * weigh the scores based on the
     */
    public abstract update(weights? :  Map<string, number>) : void;

    /**
     * Getter for the container's score.
     */
    public getScore() : number {
        return this.score;
    };

    /**
     * Getter for the container's score as percent value.
     */
    public getScorePercentage() : number {
        return Math.round(this.getScore() * 1000)/10
    }

    /**
     * Static comparator method. Compares two ScoreContainers so that they
     * are sorted in a descending order. Can be used with Array.prototype.sort();
     */
    public static compareDesc (a : CompoundScoreContainer , b : CompoundScoreContainer) {
        if (a.getScore() < b.getScore()) {
            return -1;
        }
        if (a.getScore() > b.getScore()) {
            return 1;
        }

        return 0;
    }

    /**
     * Static comparator method. Compares two ScoreContainers so that they
     * are sorted in a ascending order. Can be used with Array.prototype.sort();
     */
    public static compareAsc (a : CompoundScoreContainer , b : CompoundScoreContainer) {
        if (a.getScore() > b.getScore()) {
            return -1;
        }
        if (a.getScore() < b.getScore()) {
            return 1;
        }

        return 0;
    }
}



/**
 * The MediaObjectScoreContainer is a CompoundScoreContainer for MediaObjects. It is associated with
 * a single MediaObject (e.g. a video, audio or 3d-model file) and holds the score for that object. That
 * score is determined by the scores of the SegmentScoreContainers hosted by a concrete instance of this class.
 */
export class MediaObjectScoreContainer extends CompoundScoreContainer {
    /** Map of SegmentScoreContainer for all the SegmentObject's that belong to this MediaObject. */
    private segmentScores : Map<string, SegmentScoreContainer> = new Map();

    /** SegmentId of the segment that is representative for this MediaObject. */
    private representativeSegmentId : string;

    /** Reference to the actual MediaObject this container belongst to. */
    public mediaObject? : MediaObject;

    /**
     * Getter for the list of map for segment-scores.
     *
     * @returns {[segmentId : string] : SegmentScoreContainer}
     */
    public getSegmentScores() : Map<string, SegmentScoreContainer>  {
        return this.segmentScores;
    }

    /**
     * Number of segments for
     * @returns {MediaObject}
     */
    public getSegments() : number {
        return this.segmentScores.size;
    }


    /**
     * Getter for representativeSegmentId.
     *
     * @returns {string}
     */
    public getRepresentativeSegmentId() : string {
        return this.representativeSegmentId;
    }

    /**
     * Adds a MediaSegment to the MediaObjectContainer. That Segment is actually not
     * added to the container itself but to the respective SegmentScoreContainer (contained in
     * {segmentScores})
     *
     * @param segment MediaSegment to add.
     */
    public addMediaSegment(segment : MediaSegment) {
        if (!this.segmentScores.has(segment.segmentId)) this.segmentScores.set(segment.segmentId, new SegmentScoreContainer());
        this.segmentScores.get(segment.segmentId).mediaSegment = segment;
    }

    /**
     *
     * @param category
     * @param similarity
     */
    public addSimilarity(category : string, similarity : Similarity) {
        if (!this.segmentScores.has(similarity.key)) this.segmentScores.set(similarity.key, new SegmentScoreContainer());
        this.segmentScores.get(similarity.key).addSimilarity(category, similarity);
        this.update();
    }

    /**
     * Updates the weights of this MediaObjectScoreContainer. Currently, the highest weight
     * of the hosted segments is used as weight!
     *
     * TODO: Check if maybe mean value would be better suited.
     *
     * @param weights
     */
    public update(weights? :  Map<string, number>) {
        this.score = 0;
        this.segmentScores.forEach(function(value : SegmentScoreContainer, key: string) {
            let score = value.getScore();
            if (this.score < score) {
                this.score = score;
                this.representativeSegmentId = key;
            }
        }.bind(this))
    }

    /**
     * Method used by the UI/Template part. Can be used to determine whether this MediaObjectScoreContainer
     * is ready to be displayed.
     *
     * @returns {boolean} true if it can be displayed, false otherwise.
     */
    public show() : boolean {
        return this.mediaObject != undefined && this.segmentScores.size > 0;
    }
}


/**
 * The SegmentScoreContainer is a CompoundScoreContainer for MediaSegments. It is associated with
 * a single segment (e.g. a shot of a video) and holds the score for that segment. That
 * score is determined by the actual scores of the segment (per category).
 */
export class SegmentScoreContainer extends CompoundScoreContainer {
    /** List of scores. Entries should correspond to those in the array categories. */
    private scores : Map<string, number> = new Map();

    /** List of weights. Entries should correspond to categories in the array scores. */
    private weights : Map<string, number> = new Map();

    /** Reference to the actual MediaSegment this container belongs to. */
    public mediaSegment? : MediaSegment;

    /**
     * Adds a similarity object to this SegmentScoreContainer by pushing the category and
     * the actual value to their respective arrays.
     *
     * Note: Causes an update of the score value.
     *
     * @param category
     * @param similarity
     */
    public addSimilarity(category : string, similarity : Similarity) {
        this.scores.set(category, similarity.value);
        this.weights.set(category, 0);
        let weight = 1 / this.weights.size;
        this.weights.forEach(function(value : number, key : string) {
            this.weights.set(key, weight);
        }.bind(this));
        this.update();
    }

    /**
     * Updates the score value by weighing the scores in the array scores by the weight
     * associated in the weights objects. If no such object was defined, all values are
     * weighted equally.
     *
     * @param weights
     */
    public update(weights? : Map<string, number>) {
        this.score = 0;
        if (weights == undefined) weights = this.weights;
        this.scores.forEach(function(value : number, key : string) {
            this.score+=value * weights.get(key);
        }.bind(this));
    }
}