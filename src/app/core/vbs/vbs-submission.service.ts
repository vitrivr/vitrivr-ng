import {Injectable} from "@angular/core";
import {SegmentScoreContainer} from "../../shared/model/results/scores/segment-score-container.model";
import {MetadataLookupService} from "../lookup/metadata-lookup.service";
import {VideoUtil} from "../../shared/util/video.util";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ConfigService} from "../basics/config.service";
import {Observable} from "rxjs/Observable";
import {VbsSequenceLoggerService} from "./vbs-sequence-logger.service";

/**
 * This service orchestrates similarity queries using the Cineast API (WebSocket). The service is responsible for
 * issuing findSimilar requests, processing incoming responses and ranking of the queries.
 */
@Injectable()
export class VbsSubmissionService {
    /** URL pointing to the VBS HTTP endpoint. */
    private _endpoint: string = null;

    /** VBS team number. */
    private _team: string = null;

    /**
     * Constructor for VbsSubmissionService.
     *
     * @param {MetadataLookupService} _metadata
     * @param {HttpClient} _http
     */
    constructor(_config: ConfigService, private _metadata: MetadataLookupService, private _http: HttpClient, private _logger: VbsSequenceLoggerService) {
        _config.asObservable().subscribe(c => {
            this._endpoint = c.vbsEndpoint;
            this._team = c.vbsTeam;
        });
    }

    /**
     * Submits the provided SegmentScoreContainer and to the VBS endpoint. Uses the segment's start timestamp as timepoint.
     *
     * @param {SegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
     */
    public submitSegment(segment: SegmentScoreContainer): Observable<string | {}> {
       return this.submit(segment, segment.starttime);
    }

    /**
     * Submits the provided SegmentScoreContainer and the given time to the VBS endpoint.
     *
     * @param {SegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
     * @param {number} time Time in seconds which should be submitted. This value will be transformed into a frame number.
     */
    public submit(segment: SegmentScoreContainer, time: number): Observable<string | {}> {
        if (!this.isOn) return Observable.throw(new Error("VBS service is inactive or was not properly configured."));
        return this._metadata.lookup(segment.objectId)
            .flatMap(s => Observable.from(s))
            .filter(m => m.domain === "technical" && m.key === "fps")
            .map(m => m.value)
            .defaultIfEmpty(VideoUtil.bestEffortFPS(segment))
            .flatMap(s => {
                let params = new HttpParams()
                    .set('video', segment.objectId)
                    .set('team', this._team)
                    .set('frame', String(VbsSubmissionService.timeToFrame(time, s)))
                    .set('shot', String(segment.mediaSegment.sequenceNumber));
                if (this._logger.isEmpty()) {
                    //params.set('iseq', this._logger.sequence);
                    //this._logger.clear();
                }
                return this._http.get(this._endpoint, {responseType: 'text', params: params})
            });
    }

    /**
     * Returns true uf VBS mode is active and properly configured (i.e. endpoint and team ID is specified).
     *
     * @return {boolean}
     */
    get isOn(): boolean {
        return this._endpoint != null && this._team != null;
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