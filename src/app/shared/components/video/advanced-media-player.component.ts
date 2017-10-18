import {Component, Input} from "@angular/core";
import {MediaObjectScoreContainer} from "../../model/features/scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../../model/features/scores/segment-score-container.model";
import {ResolverService} from "../../../core/basics/resolver.service";
import {VgAPI} from "videogular2/core";

declare var VTTCue;

@Component({
    moduleId: module.id,
    selector: 'advanced-media-player',
    templateUrl: 'advanced-media-player.component.html',
    styleUrls: ['advanced-media-player.component.css']
})
export class AdvancedMediaPlayerComponent {
    /** The MediaObjectScoreContainer that should be displayed. */
    @Input()
    public mediaobject: MediaObjectScoreContainer;

    /** The SegmentScoreContainer that is currently in focus. Can be null! */
    @Input()
    public focus: SegmentScoreContainer;

    /** Flag indicating whether the media component should auto play. */
    @Input()
    public auto: boolean = false;

    /** Width of the media player in pixels. This property will automatically determine the height of the component as well. */
    @Input()
    public width: number = 500;

    /** The internal VgAPI reference used to interact with the media player. */
    private _api: VgAPI;

    /** The internal VgAPI reference used to interact with the media player. */
    private _track: TextTrack;

    /**
     * Default constructor.
     *
     * @param {ResolverService} _resolver
     */
    constructor(public readonly _resolver: ResolverService) {
    }

    /**
     *
     * @param api
     */
    public onPlayerReady(api: VgAPI) {
        this._api = api;

        /* Adds a text track and creates a cue per segment in the media object. */
        this._api.addTextTrack("metadata", "Segments");
        this._track = this._api.textTracks[0];
        for (let segment of this.mediaobject.segments) {
            let cue = new VTTCue(segment.starttime, segment.endtime, "Segment: " + segment.segmentId);
            cue.id = segment.segmentId;
            this._track.addCue(cue)
        }

        /* Add callback for when the loading of media starts. */
        this._api.getDefaultMedia().subscriptions.loadStart.subscribe(() => this.seekToFocusPosition())
    }

    /**
     * Seeks to the position of the focus segment. If that position is undefined, this method has no effect.
     */
    public seekToFocusPosition() {
        if (this.focus) this._api.seekTime(this.focus.starttime);
    }

    /**
     * Getter for the track object.
     *
     * @return {TextTrack}
     */
    get track(): TextTrack {
        return this._track;
    }
}