import {Component, Input} from "@angular/core";
import {MediaObjectScoreContainer} from "../../model/features/scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../../model/features/scores/segment-score-container.model";
import {ResolverService} from "../../../core/basics/resolver.service";
import {VgAPI} from "videogular2/core";
import {VbsSubmissionService} from "../../../core/vbs/vbs-submission.service";

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
     * @param {ResolverService} _resolver  Injected service to resolve names of resources.
     */
    constructor(public readonly _resolver: ResolverService, private readonly _vbs: VbsSubmissionService) {
    }

    /**
     * Callback that is invoked once the Vg player is ready.
     *
     * @param api VgAPI instance.
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
     * Submits the current playbackof the player to the VBS endpoint. The VBS endpoint expects the playback position
     * to be submitted in frames. As there is no native way to extract the frame number from a JavaScript video player,
     * the method uses the FPS value of the video and the current time to calculate the current frame.
     *
     * If the FPS value is known for the video (from the metadata), that value is used. Otherwise, a best effort
     * estimate is calculated using the focus segment.
     */
    public onSubmitPressed() {
        /* Ask for user confirmation and submit the values. */
        if (confirm("Are you sure you want to submit the current position of video '" + this.mediaobject.objectId + "' to the VBS API?")) {
            this._vbs.submit(this.focus, this._api.currentTime);
        }
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

    /**
     * Returns true, if the submit (to VBS) button should be displayed and false otherwise. This depends on the configuration and
     * the media type of the object.
     *
     * @return {boolean}
     */
    get showsubmit(): boolean {
        return this.mediaobject.mediatype == 'VIDEO' && this._vbs.isOn;
    }
}