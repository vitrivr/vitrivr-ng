import {Injectable} from "@angular/core";
import {SegmentScoreContainer} from "../../shared/model/features/scores/segment-score-container.model";
import {MetadataLookupService} from "../lookup/metadata-lookup.service";
import {VideoUtil} from "../../shared/util/video.util";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ConfigService} from "../basics/config.service";
import {Observable} from "rxjs/Observable";

/**
 * This service orchestrates similarity queries using the Cineast API (WebSocket). The service is responsible for
 * issuing findSimilar requests, processing incoming responses and ranking of the queries.
 */
@Injectable()
export class VbsSubmissionService {
    /** URL of the VBS endpoint. */
    private _vbsEndpoint;

    /** ID of the VBS team. */
    private _vbsTeam;

    /** ID of the VBS team. */
    private _vbsOn;

    /**
     * Constructor for VbsSubmissionService.
     * 
     * @param {MetadataLookupService} _metadata
     * @param {HttpClient} _http
     * @param {ConfigService} _config
     */
    constructor(private _metadata: MetadataLookupService, private _http: HttpClient, _config: ConfigService) {
        this._vbsOn = _config.configuration.vbsOn;
        this._vbsEndpoint = _config.configuration.vbsEndpoint;
        this._vbsTeam = _config.configuration.vbsTeam;
    }

    /**
     * Submits the provided SegmentScoreContainer and to the VBS endpoint. Uses the segment's start timestamp as timepoint.
     *
     * @param {SegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
     */
    public submitSegment(segment: SegmentScoreContainer) {
       this.submit(segment, segment.starttime);
    }

    /**
     * Submits the provided SegmentScoreContainer and the given time to the VBS endpoint.
     *
     * @param {SegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
     * @param {number} time Time in seconds which should be submitted. This value will be transformed into a frame number.
     */
    public submit(segment: SegmentScoreContainer, time: number) {
        if (!this._vbsOn) throw new Error("VBS service is currently inactive or has not been properly configured.");
        let observable = this._metadata.lookup(segment.objectId)
            .flatMap(s => Observable.from(s))
            .filter(m => m.domain === "technical" && m.key === "fps")
            .map(m => m.value)
            .defaultIfEmpty(VideoUtil.bestEffortFPS(segment))
            .flatMap(s => this._http.get(this._vbsEndpoint, {responseType: 'text', params: new HttpParams().set('video', segment.objectId).set('team', String(this._vbsTeam)).set('frame', String(VbsSubmissionService.timeToFrame(time, s)))}))
            .catch((e,o) => {
                console.log("Failed to submit segment to VBS due to error.");
                return Observable.empty();
            })
            .subscribe(s => console.log("Successfully submitted segment to VBS endpoint."));
    }

    /**
     * Returns true uf VBS mode is active and properly configured (i.e. endpoint and team ID is specified).
     *
     * @return {any}
     */
    get isOn() {
        return this._vbsOn && this._vbsEndpoint != null && this._vbsTeam != null;
    }

    /**
     * Convenience method to transform the timestamp within a video into a frame index.
     *
     * @param {number} timestamp Timestamp within the video.
     * @param {number} fps The FPS of the video.
     */
    private static timeToFrame(timestamp: number, fps: number) {
        return Math.floor(timestamp * fps);
    }
}