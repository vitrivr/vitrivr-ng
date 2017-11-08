import {Component, Input} from "@angular/core";
import {MediaObjectScoreContainer} from "../../model/features/scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../../model/features/scores/segment-score-container.model";
import {ResolverService} from "../../../core/basics/resolver.service";
import {VgAPI} from "videogular2/core";
import {ConfigService} from "../../../core/basics/config.service";
import {Http, RequestOptionsArgs} from "@angular/http";
import {MetadataLookupService} from "../../../core/lookup/metadata-lookup.service";
import {VideoUtil} from "../../util/video.util";

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

    /** The FPS value for the current video (-1 = indeterminate). */
    private _fps: number = -1;

    /**
     * Default constructor.
     *
     * @param {ResolverService} _resolver  Injected service to resolve names of resources.
     * @param {ConfigService} _config Injected service to access application configuration.
     * @param {Http} _http Injected service to send XHRHttpRequests
     * @param {MetadataLookupService} _metadata Injected service to access object metadata through the Cineast API.
     */
    constructor(public readonly _resolver: ResolverService, private readonly _config: ConfigService, private _http: Http, private _metadata: MetadataLookupService) {
        this._metadata.first().subscribe(s => {
            for (let metadata of s.content) {
                if (metadata.domain === "technical" && metadata.key === "fps") {
                    this._fps = metadata.value;
                }
            }
        })
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
        /* Determine necessary values. */
        let frame = 0;
        if (this._fps <= 0) {
            frame = Math.floor(this._api.currentTime * VideoUtil.bestEffortFPS(this.focus));
            console.log("FPS value could not be load from metadata. Fallback to a best effort estimate.");
        } else {
            frame = Math.floor(this._api.currentTime * this._fps);
        }

        /* Ask for user confirmation and submit the values. */
        if (confirm("Are you sure you want to submit the current position (frame: " + frame + ") of video '" + this.mediaobject.objectId + "' to VBS?")) {
            let options = <RequestOptionsArgs>{params: { video: this.mediaobject.objectId, team : this._config.configuration.vbsTeam, frame: frame}};
            this._http.get(this._config.configuration.vbsEndpoint, options).first().subscribe((r) => {
                /* TODO: Handle response */
                console.log(r.toString());
            });
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
        return this.mediaobject.mediatype == 'VIDEO' && this._config.configuration.vbsOn && (this._config.configuration.vbsEndpoint != null);
    }
}