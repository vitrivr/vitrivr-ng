import {Injectable} from "@angular/core";
import {SegmentScoreContainer} from "../../shared/model/results/scores/segment-score-container.model";
import {MetadataLookupService} from "../lookup/metadata-lookup.service";
import {VideoUtil} from "../../shared/util/video.util";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {ConfigService} from "../basics/config.service";
import {Observable, of, Subscription} from "rxjs";
import {MatSnackBar} from "@angular/material";
import {Config} from "../../shared/model/config/config.model";
import {EventBusService} from "../basics/event-bus.service";
import {Subject} from "rxjs";
import {VbsSubmission} from "./vbs-action.model";
import {buffer, catchError, flatMap, map, withLatestFrom} from "rxjs/operators";
import {SelectionService} from "../selection/selection.service";
import {SubmittedEvent} from "../../shared/model/vbs/interfaces/event.model";

/**
 * This service is used to submit segments to VBS web-service for the Video Browser Showdown challenge. Furthermore, if
 * the VBS mode is active, it listens to events emmited on the EventBus and maps them to VbsActions
 */
@Injectable()
export class VbsSubmissionService {
    /** The observable used to react to changes to the Vitrivr NG configuration. */
    private _config: Observable<[string, string, number]>;

    /** The subject used to submit segments to the VBS service. */
    private _submitSubject = new Subject<[SegmentScoreContainer, number]>();

    /** Reference to the subscription that maps events from the EventBusService to VbsActions and records them. */
    private _vbsSubscription: Subscription;

    /** Reference to the subscription to the vitrivr NG configuration. */
    private _configSubscription: Subscription;

    /**
     * Constructor for VbsSubmissionService.
     *
     * @param {ConfigService} _config
     * @param {EventBusService} _eventbus Reference to the singleton EventBusService instance.
     * @param {SelectionService} _selection Reference to the singleton SelectionService instance.
     * @param {MetadataLookupService} _metadata
     * @param {HttpClient} _http
     * @param {MatSnackBar} _snackBar
     */
    constructor(_config: ConfigService,
                private _eventbus: EventBusService,
                private _selection: SelectionService,
                private _metadata: MetadataLookupService,
                private _http: HttpClient,
                private _snackBar: MatSnackBar) {
        this._config = _config.asObservable().pipe(
            map(c => <[string, string, number]>[c.get<string>('vbs.endpoint'), c.get<string>('vbs.teamid'), c.get<number>('vbs.toolid')])
        );


        /* This subscription registers the event-mapping, recording and submission stream if the VBS mode is active and un-registers it, if it is switched off! */
        this._configSubscription = this._config.subscribe(([endpoint, team, tool]) => {
            if (endpoint && team && tool) {
                this.reset(endpoint, team, tool)
            } else if (this._vbsSubscription != null) {
                this._vbsSubscription.unsubscribe();
                this._vbsSubscription = null;
            }
        });
    }

    /**
     * Submits the provided SegmentScoreContainer and to the VBS endpoint. Uses the segment's start timestamp as timepoint.
     *
     * @param {SegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
     */
    public submitSegment(segment: SegmentScoreContainer) {
       this.submit(segment, segment.startabs);
    }

    /**
     * Submits the provided SegmentScoreContainer and the given time to the VBS endpoint.
     *
     * @param {SegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
     * @param {number} time Time in seconds which should be submitted. This value will be transformed into a frame number.
     */
    public submit(segment: SegmentScoreContainer, time: number) {
        this._submitSubject.next([segment, time]);
        this._selection.add(this._selection.availableTags[0],segment.segmentId);
    }

    /**
     * Resets the VBSSubmissionService, re-initiating
     */
    public reset(endpoint?: string, team?: string, tool?: number) {
        if (this._vbsSubscription != null) {
            this._vbsSubscription.unsubscribe();
            this._vbsSubscription = null;
        }

        let events = VbsSubmission.mapEventStream(this._eventbus.observable()).pipe(
            buffer(this._submitSubject)
        );

        this._vbsSubscription = this._submitSubject.pipe(
            map(([segment,time]): [SegmentScoreContainer, number] => {
                let fps = Number.parseFloat(segment.objectScoreContainer.metadataForKey("technical.fps"));
                if (Number.isNaN(fps) || !Number.isFinite(fps)) {
                    fps = VideoUtil.bestEffortFPS(segment);
                }
                return [segment,VbsSubmissionService.timeToFrame(time,fps)]
            }),
            withLatestFrom(events,([segment,frame],submitted): [SegmentScoreContainer,number,SubmittedEvent[]] => [segment,frame,submitted]),
            flatMap(([segment,frame,submitted]) => {
                let videoId = parseInt(segment.objectId.replace("v_","")).toString();
                let params = new HttpParams().set('team', String(team)).set('member', String(tool)).set('video',videoId).set('frame', String(frame));
                let iseq = new VbsSubmission(team, tool);
                iseq.events.push(...submitted);

                /* Prepare VBS submission. */
                let headers = new HttpHeaders().append("Content-Type","application/json");
                let observable = this._http.post(String(endpoint), JSON.stringify(iseq), {responseType: 'text', headers: headers, params: params});

                console.log(`Submitting video to VBS; id: ${videoId}, frame: ${frame}`);
                return observable.pipe(
                    catchError((err) => of(`Failed to submit segment to VBS due to a HTTP error (${err.status}).`))
                );
            }),
            map((msg: string) => {
                if (msg.indexOf("Correct") > -1) {
                    return [msg,"snackbar-success"];
                }else if (msg.indexOf("Failed") > -1) {
                    return [msg,"snackbar-error"];
                } else {
                    return [msg,"snackbar-warning"];
                }
            }
        )).subscribe(([msg,clazz]) => {
            this._snackBar.open(msg,null, {duration: Config.SNACKBAR_DURATION, panelClass: clazz});
        });
    }

     /**
     * Returns true uf VBS mode is active and properly configured (i.e. endpoint and team ID is specified).
     *
     * @return {boolean}
     */
    get isOn(): Observable<boolean> {
        return this._config.pipe(map(([endpoint,team]) => endpoint != null && team != null));
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