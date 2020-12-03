import {AfterViewChecked, ChangeDetectorRef, Component, Input} from '@angular/core';
import {MediaObjectScoreContainer} from '../../model/results/scores/media-object-score-container.model';
import {SegmentScoreContainer} from '../../model/results/scores/segment-score-container.model';
import {ResolverService} from '../../../core/basics/resolver.service';
import {VbsSubmissionService} from '../../../core/vbs/vbs-submission.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {VgApiService} from '@videogular/ngx-videogular/core';
import {ContextKey, InteractionEventComponent} from '../../model/events/interaction-event-component.model';
import {InteractionEvent} from '../../model/events/interaction-event.model';
import {InteractionEventType} from '../../model/events/interaction-event-type.model';
import {EventBusService} from '../../../core/basics/event-bus.service';


declare var VTTCue;

@Component({

  selector: 'app-advanced-media-player',
  templateUrl: 'advanced-media-player.component.html',
  styleUrls: ['advanced-media-player.component.css']
})
export class AdvancedMediaPlayerComponent implements AfterViewChecked {
  /** The MediaObjectScoreContainer that should be displayed. */
  @Input()
  public mediaobject: MediaObjectScoreContainer;

  /** The SegmentScoreContainer that is currently in focus. Can be null! */
  @Input()
  public focus: SegmentScoreContainer;

  /** Flag indicating whether the media component should auto play. */
  @Input()
  public auto = false;

  /** Width of the media player in pixels. This property will automatically determine the height of the component as well. */
  @Input()
  public width;

  /** The internal VgAPI reference used to interact with the media player. */
  private _api: VgApiService;

  /** The internal VgAPI reference used to interact with the media player. */
  private readonly _track: BehaviorSubject<TextTrack>;

  constructor(public readonly _resolver: ResolverService, private readonly _vbs: VbsSubmissionService, private _cdRef: ChangeDetectorRef, private _eventBusService: EventBusService) {
    this._track = new BehaviorSubject<TextTrack>(null)
  }

  /**
   * Getter for the track object.
   *
   * @return {TextTrack}
   */
  get track(): Observable<TextTrack> {
    return this._track;
  }

  /**
   * Returns true, if the submit (to VBS) button should be displayed and false otherwise. This depends on the configuration and
   * the media type of the object.
   *
   * @return {Observable<boolean>}
   */
  get showVbsSubmitButton(): Observable<boolean> {
    return this._vbs.isOn;
  }

  /**
   * Callback that is invoked once the Vg player is ready.
   *
   * @param api VgAPI instance.
   */
  public onPlayerReady(api: VgApiService) {
    this._api = api;

    /* Adds a text track and creates a cue per segment in the media object. */
    this._api.addTextTrack('metadata', 'Segments');
    for (const segment of this.mediaobject.segments) {
      const cue = new VTTCue(segment.startabs, segment.endabs, 'Segment: ' + segment.segmentId);
      cue.id = segment.segmentId;
      this._api.textTracks[0].addCue(cue)
    }

    /* Add callback for when the loading of media starts. */
    this._track.next(this._api.textTracks[0]);
    this._api.getDefaultMedia().subscriptions.loadedData.pipe(first()).subscribe(() => this.seekToFocusPosition());
  }

  /**
   * https://github.com/videogular/videogular2/issues/720
   */
  ngAfterViewChecked() {
    this._cdRef.detectChanges();
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
    console.debug(`submitting for time ${this._api.currentTime}`);
    this._vbs.submit(this.focus, this._api.currentTime);
  }

  /**
   * Seeks to the position of the focus segment. If that position is undefined, this method has no effect.
   */
  public seekToFocusPosition() {
    if (this.focus) {
      this._api.seekTime(this.focus.startabs);
    }
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediaobject', this.focus.objectId);
    context.set('i:starttime', this.focus.startabs);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.PLAY, context)))
  }

  /**
   * Seeks to the position of the focus segment. If that position is undefined, this method has no effect.
   */
  public seekToNext() {
    const time = this._api.time.current / 1000;
    const times = this.mediaobject.segments.map(s => s.startabs).filter(t => t > time).sort((a, b) => a - b);
    if (times.length > 0) {
      this._api.seekTime(times[0])
    }
  }

  /**
   * Seeks to the position of the focus segment. If that position is undefined, this method has no effect.
   */
  public seekToPrevious() {
    const time = this._api.time.current / 1000;
    const times = this.mediaobject.segments.map(s => s.startabs).filter(t => t < time).sort((a, b) => b - a);
    if (times.length > 0) {
      this._api.seekTime(times[0])
    }
  }
}
