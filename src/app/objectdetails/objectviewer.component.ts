import {Component, Input, ViewChild} from '@angular/core';
import {ResolverService} from '../core/basics/resolver.service';
import {EventBusService} from '../core/basics/event-bus.service';
import {PreviousRouteService} from '../core/basics/previous-route.service';
import {ContextKey, InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';
import {MediaObjectDescriptor, MediaSegmentDescriptor} from '../../../openapi/cineast';


@Component({
  selector: 'app-objectviewer',
  templateUrl: 'objectviewer.component.html',
})
export class ObjectviewerComponent {
  @ViewChild('audioplayer')
  public audioplayer: any;

  @ViewChild('videoplayer')
  public videoplayer: any;

  @ViewChild('imageviewer')
  public imageviewer: any;

  @Input() mediaobject: MediaObjectDescriptor;

  constructor(
    private _eventBusService: EventBusService,
    public _resolver: ResolverService,
    private _historyService: PreviousRouteService,
  ) {
    console.debug(`initializing objectviewer`)
  }

  /**
   * Triggered whenever someone clicks the 'Back' button. Returns to the last page,
   * i.e. usually the gallery.
   */
  public onBackClick() {
    if (this._historyService.getPreviousRoute()) {
      this._historyService.goToPrevious();
      return
    }
    this._historyService.goToRoot();
  }

  public onPlayClick(segment: MediaSegmentDescriptor) {
    if (this.audioplayer !== undefined) {
      this.audioplayer.nativeElement.currentTime = segment.startabs;
      this.audioplayer.nativeElement.play();
    } else if (this.videoplayer !== undefined) {
      this.videoplayer.nativeElement.currentTime = segment.startabs;
      this.videoplayer.nativeElement.play();
    }

    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediaobject', segment.objectId);
    context.set('i:starttime', segment.startabs);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.PLAY, context)))
  }

}
