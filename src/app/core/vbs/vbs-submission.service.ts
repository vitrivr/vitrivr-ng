import {Injectable} from "@angular/core";
import {SegmentScoreContainer} from "../../shared/model/results/scores/segment-score-container.model";
import {MetadataLookupService} from "../lookup/metadata-lookup.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ConfigService} from "../basics/config.service";
import {Observable, of, Subscription} from "rxjs";
import {MatSnackBar} from "@angular/material";
import {Config} from "../../shared/model/config/config.model";
import {EventBusService} from "../basics/event-bus.service";
import {Subject} from "rxjs";
import {catchError, flatMap, map} from "rxjs/operators";
import {SelectionService} from "../selection/selection.service";

/**
 * This service is used to submit segments to VBS web-service for the Video Browser Showdown challenge. Furthermore, if
 * the VBS mode is active, it listens to events emmited on the EventBus and maps them to VbsActions
 */
@Injectable()
export class VbsSubmissionService {
    /** The observable used to react to changes to the Vitrivr NG configuration. */
    private _config: Observable<[string, string]>;

    /** The subject used to submit segments to the VBS service. */
    private _submitSubject = new Subject<SegmentScoreContainer>();

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
            map(c => <[string, string]>[c.get<string>('vbs.endpoint'), c.get<string>('vbs.teamid')])
        );


        /* This subscription registers the event-mapping, recording and submission stream if the VBS mode is active and un-registers it, if it is switched off! */
        this._configSubscription = this._config.subscribe(([endpoint, team]) => {
            if (endpoint && team) {
                this.reset(endpoint, team)
            } else if (this._vbsSubscription != null) {
                this._vbsSubscription.unsubscribe();
                this._vbsSubscription = null;
            }
        });
    }

    /**
     * Submits the provided SegmentScoreContainer and the given time to the VBS endpoint.
     *
     * @param {SegmentScoreContainer} segment Segment which should be submitted. It is used to access the ID of the media object and to calculate the best-effort frame number.
     * @param number time
     */
    public submit(segment: SegmentScoreContainer, time: number = -1) {
        this._submitSubject.next(segment);
        this._selection.add(this._selection.availableTags[0],segment.segmentId);
    }

    /**
     * Resets the VBSSubmissionService, re-initiating
     */
    public reset(endpoint?: string, team?: string) {
        if (this._vbsSubscription != null) {
            this._vbsSubscription.unsubscribe();
            this._vbsSubscription = null;
        }

        this._vbsSubscription = this._submitSubject.pipe(
             flatMap((segment) => {
                let image = segment.segmentId.substring(3) + "_000.jpg";
                let params = new HttpParams().set('team', String(team)).set('image', image);

                /* Prepare VBS submission. */
                let observable = this._http.get(String(endpoint), {responseType: 'text', params: params});

                console.log(`Submitting image to LSC; id: ${image}`);
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
}
