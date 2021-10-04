import {Component, ViewChild} from '@angular/core';
import {MediaSegmentDescriptor, MetadataService, Tag, TagService} from '../../../openapi/cineast';
import {ContextKey, InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';
import {EventBusService} from '../core/basics/event-bus.service';

@Component({
  selector: 'app-segment-features',
  templateUrl: 'segment-features.component.html',
  styleUrls: ['../objectdetails/objectdetails.component.css']
})
export class SegmentFeaturesComponent {

  @ViewChild('segmentFeaturesComponent')
  segmentFeaturesComponent: SegmentFeaturesComponent;

  segmentId: string
  _tags: Tag[] = [];
  _captions: string[] = [];
  _asr: string[] = [];
  _ocr: string[] = [];

  constructor(private _eventBusService: EventBusService, private _metaService: MetadataService, private _tagService: TagService) {
  }

  public onLoadFeaturesButtonClicked(segment: MediaSegmentDescriptor) {
    this._tags = [];
    this._captions = [];
    this._asr = [];
    this._ocr = [];
    this.segmentId = segment.segmentId;

    /* Emit an EXAMINE event on the bus. */
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.LOAD_FEATURES, context)));

    // get the tags associated with a segmentid
    this._metaService.findTagsById(segment.segmentId).subscribe(tagIds =>
      // needed to receive remaining information for a tag object, since cineast only sends its id
      this._tagService.findTagsById({ids: tagIds.tagIDs}).subscribe(res => {
        this._tags = res.tags;
      })
    );
    // get the captions associated with a segmentId
    this._metaService.findTextByIDAndCat(segment.segmentId, 'scenecaption').subscribe(captions => this._captions = captions.featureValues);
    // get the ASR data associated with a segmentId
    this._metaService.findTextByIDAndCat(segment.segmentId, 'asr').subscribe(asr => this._asr = asr.featureValues);
    // get the OCR data associated with a segmentId
    this._metaService.findTextByIDAndCat(segment.segmentId, 'ocr').subscribe(ocr => this._ocr = ocr.featureValues);
  }
}
