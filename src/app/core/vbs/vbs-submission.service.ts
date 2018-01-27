import {Injectable} from "@angular/core";
import {SegmentScoreContainer} from "../../shared/model/results/scores/segment-score-container.model";
import {MetadataLookupService} from "../lookup/metadata-lookup.service";
import {VideoUtil} from "../../shared/util/video.util";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {ConfigService} from "../basics/config.service";
import {Observable} from "rxjs/Observable";
import {MatSnackBar} from "@angular/material";
import {Config} from "../../shared/model/config/config.model";
import {EventBusService} from "../basics/event-bus.service";
import {Subject} from "rxjs/Subject";
import {VbsAction} from "./vbs-action.model";
import {Subscription} from "rxjs/Subscription";

/**
 * This service is used to submit segments to VBS web-service for the Video Browser Showdown challenge. Furthermore, if
 * the VBS mode is active, it listens to events emmited on the EventBus and maps them to VbsActions
 */
@Injectable()
export class VbsSubmissionService {
    /** The observable used to react to changes to the Vitrivr NG configuration. */
    private _config: Observable<[string,string, string]>;

    /** A buffer of old, already submitted sequences. */
    private _seqBuffer: string[] = [];

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
     * @param {EventBusService} _eventBusService Reference to the singleton EventBusService instance.
     * @param {MetadataLookupService} _metadata
     * @param {HttpClient} _http
     * @param {MatSnackBar} _snackBar
     */
    constructor(_config: ConfigService, private _eventBusService: EventBusService, private _metadata: MetadataLookupService, private _http: HttpClient, private _snackBar: MatSnackBar) {
        this._config = _config.asObservable()
            .map(c => <[string,string, string]>[c.get<string>('vbs.endpoint'), c.get<string>('vbs.teamid'), c.get<string>('vbs.toolid')]);


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
       return this.submit(segment, segment.starttime);
    }

    /**
     * Submits the provided SegmentScoreContainer and the given time to the VBS endpoint.
     *
     * @param {SegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
     * @param {number} time Time in seconds which should be submitted. This value will be transformed into a frame number.
     */
    public submit(segment: SegmentScoreContainer, time: number) {
        this._submitSubject.next([segment, time]);
    }

    /**
     * Clears all the VbsActions that have been recorded so far.
     */
    public clear() {
        this._seqBuffer = []
    }

    /**
     * Resets the VBSSubmissionService, re-initiating
     */
    public reset(endpoint?: string, team?: string, tool?: string) {
        if (this._vbsSubscription != null) {
            this._vbsSubscription.unsubscribe();
            this._vbsSubscription = null;
        }

        let time = Date.now(); /* Time of the reset. */
        let events = VbsAction.mapEventStream(this._eventBusService.observable())
            .buffer(this._submitSubject)
            .map(ev => ev.map(e => e.map(a => `${a.action}(${Math.round((a.timestamp-time)/1000)}s${a.context ? "," + a.context : ""}`.toString()).reduce((a1,a2) => a1 + a2)).join(VbsAction.SEPARATOR))
            .do(seq => {
                let date = new Date();
                let time = `time ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                if (seq && seq.length > 0) {
                    this._seqBuffer.push(seq + VbsAction.SEPARATOR + time);
                } else {
                    this._seqBuffer.push(time);
                }
            });

            this._vbsSubscription = this._submitSubject
            .flatMap(([segment,time]) => {
                return this._metadata.lookup(segment.objectId)
                    .flatMap(s => Observable.from(s))
                    .filter(m => m.domain === "technical" && m.key === "fps")
                    .map(m => m.value)
                    .defaultIfEmpty(VideoUtil.bestEffortFPS(segment))
                    .first();
            },([segment,time], fps) => [segment,VbsSubmissionService.timeToFrame(time,fps)])
            .withLatestFrom(events,([segment,frame]) => [segment,frame])
            .flatMap(([segment,frame]:[SegmentScoreContainer,number]) => {
                let params = new HttpParams().set('video', segment.objectId).set('team', String(team)).set('frame', String(frame));
                let iseq = VbsAction.TOOL_ID_PREFIX + tool + VbsAction.SEPARATOR + this._seqBuffer.join(VbsAction.SEPARATOR);
                let observable = null;
                if (iseq.length > 0 && iseq.length < 255) {
                    params = params.set('iseq', iseq);
                    observable = this._http.get(String(endpoint),{responseType: 'text', params: params});
                } else if (iseq.length >= 255) {
                    params = params.set('iseq', iseq);
                    let headers = new HttpHeaders().append("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
                    observable = this._http.post(String(endpoint), params.toString(), {responseType: 'text', headers: headers})
                } else {
                    observable = this._http.get(String(endpoint), {responseType: 'text', params: params});
                }
                return observable.catch((err) => Observable.of(`Failed to submit segment to VBS due to a HTTP error (${err.status}).`));
            })
            .map((msg: string) => {
                if (msg.indexOf("Correct") > -1) {
                    return [msg,"snackbar-success"];
                }else if (msg.indexOf("Failed") > -1) {
                    return [msg,"snackbar-error"];
                } else {
                    return [msg,"snackbar-warning"];
                }
            })
            .subscribe(([msg,clazz]) => {
                this._snackBar.open(msg,null, {duration: Config.SNACKBAR_DURATION, panelClass: clazz});
            });
    }

     /**
     * Returns true uf VBS mode is active and properly configured (i.e. endpoint and team ID is specified).
     *
     * @return {boolean}
     */
    get isOn(): Observable<boolean> {
        return this._config.map(([endpoint,team]) => endpoint != null && team != null);
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