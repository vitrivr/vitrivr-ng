import {from, Observable, of} from 'rxjs';
import {InteractionEventType} from '../../shared/model/events/interaction-event-type.model';
import {InteractionEvent} from '../../shared/model/events/interaction-event.model';
import {WeightedFeatureCategory} from '../../shared/model/results/weighted-feature-category.model';
import {catchError, filter, tap} from 'rxjs/operators';
import {SubmissionType, VbsSubmission} from '../../shared/model/vbs/interfaces/vbs-submission.model';
import {InteractionEventComponent} from '../../shared/model/events/interaction-event-component.model';
import {VbsInteraction} from '../../shared/model/vbs/interfaces/vbs-interaction.model';
import {flatMap} from 'rxjs/internal/operators';

export class VbsInteractionLog implements VbsSubmission {

  /** Timestam of the VbsInteractionLog. */
  public readonly timestamp: number = Date.now();

  /** Type of the VbsInteractionLog. */
  public readonly type: SubmissionType = 'interaction';

  /** List of submitted events. */
  public readonly events: VbsInteraction[] = [];

  /**
   * This method maps the events emitted on the Vitrivr NG EventBusService to VbsActions.
   *
   * @param {Observable<Interaction>} stream The observable of the InteractionEvents as exposed by the EventBusService
   */
  public static mapEventStream(stream: Observable<InteractionEvent>): Observable<VbsInteraction> {
    return stream.pipe(
      flatMap(e => {
        if (e.components.length > 1) {
          const composit = e.components.map(c => VbsInteractionLog.mapAtomicEvent(c, e.timestamp));
          return from(composit);
        } else {
          return of(VbsInteractionLog.mapAtomicEvent(e.components[0], e.timestamp));
        }
      }),
      catchError((e, o) => {
        console.log('An error occurred when mapping an event from the event stream to a VbsSubmission: ' + e.message);
        return o;
      }),
      filter(e => e != null),
    );
  }

  /**
   * Maps a single InteractionEventComponent to an Interaction.
   *
   * @param component InteractionEventComponent
   * @param timestamp Timestamp of the event.
   */
  private static mapAtomicEvent(component: InteractionEventComponent, timestamp: number): VbsInteraction {
    switch (component.type) {
      case InteractionEventType.QUERY_MODEL3D:
      case InteractionEventType.QUERY_BOOLEAN:
      case InteractionEventType.HIGHLIGHT:
      case InteractionEventType.QUERY_AUDIO:
        console.warn(`interaction logging for ${component.type} is unsupported`)
        break;
      case InteractionEventType.PLAY:
        return <VbsInteraction>{category: 'Browsing', type: ['videoPlayer'], value: component.context.get('i:mediaobject') + ': ' + component.context.get('i:starttime'), timestamp: timestamp}
      case InteractionEventType.NEW_QUERY_STAGE:
      case InteractionEventType.NEW_QUERY_CONTAINER:
        // only used for result-logging
        break;
      case InteractionEventType.RESULT_SET_STATISTICS:
        return <VbsInteraction>{category: 'Custom', type: ['ResultSetStatistics'], timestamp: timestamp}
      case InteractionEventType.ADD_TAG_FROM_RESULT_INFO:
        return <VbsInteraction>{category: 'Custom', type: ['AddTagFromResultInfo'], value: component.context.get('i:tagid') + ': ' + component.context.get('i:tagcount'), timestamp: timestamp}
      case InteractionEventType.LOAD_FEATURES:
        return <VbsInteraction>{category: 'Custom', type: ['LoadFeatures'], value: component.context.get('i:mediasegment'), timestamp: timestamp}
      case InteractionEventType.QUERY_MOTION:
        return <VbsInteraction>{category: 'Sketch', type: ['motion'], timestamp: timestamp};
      case InteractionEventType.QUERY_SEMANTIC:
        return <VbsInteraction>{category: 'Sketch', type: ['semanticSegmentation'], timestamp: timestamp};
      case InteractionEventType.MLT:
        return <VbsInteraction>{category: 'Image', type: ['globalFeatures'], attributes: 'mlt', timestamp: timestamp};
      case InteractionEventType.QUERY_TAG:
        return <VbsInteraction>{category: 'Text', type: ['concept'], value: component.context.get('q:value'), timestamp: timestamp};
      case InteractionEventType.QUERY_FULLTEXT: {
        const event = <VbsInteraction>{category: 'Text', type: [], value: component.context.get('q:value'), timestamp: timestamp};
        const c = component.context.get('q:categories');
        if (c.indexOf('ocr') > -1) {
          event.type.push('ocr');
        }
        if (c.indexOf('asr') > -1) {
          event.type.push('asr');
        }
        if (c.indexOf('meta') > -1) {
          event.type.push('metadata');
        }
        if (c.indexOf('tagsft') > -1) {
          event.type.push('concept');
        }
        if (c.indexOf('scenecaption') > -1) {
          event.type.push('caption');
        }
        if (c.indexOf('audio') > -1) {
          event.type.push('custom');
        }
        return event;
      }
      case InteractionEventType.QUERY_IMAGE: {
        const c = component.context.get('q:categories');
        const event = <VbsInteraction>{category: 'Sketch', type: [], timestamp: timestamp};
        if ((c.indexOf('localfeatures') === -1)) {
          if (c.indexOf('globalcolor') > -1 || c.context.get('q:categories').indexOf('localcolor') > -1) {
            event.type.push('color');
          }
          if (c.indexOf('edge') > -1) {
            event.type.push('edge');
          }
        } else {
          event.category = 'Image';
          event.type.push('localFeatures', 'globalFeatures');
        }
        return event;
      }
      case InteractionEventType.FILTER:
        return <VbsInteraction>{category: 'Filter', type: [component.context.get('f:type')], value: component.context.get('f:value'), timestamp: timestamp};
      case InteractionEventType.EXPAND:
        return <VbsInteraction>{category: 'Browsing', type: ['temporalContext'], timestamp: timestamp};
      case InteractionEventType.REFINE:
        const weights = component.context.get('w:weights').map((v: WeightedFeatureCategory) => v.name + ':' + v.weightPercentage / 100).join(',');
        return <VbsInteraction>{category: 'Browsing', type: ['explicitSort'], attributes: 'adjust weights,' + weights, timestamp: timestamp};
      case InteractionEventType.EXAMINE:
        return <VbsInteraction>{category: 'Browsing', type: ['videoPlayer'], value: component.context.get('i:mediasegment'), timestamp: timestamp};
      case InteractionEventType.SCROLL:
        return <VbsInteraction>{category: 'Browsing', type: ['rankedList'], timestamp: timestamp};
      case InteractionEventType.CLEAR:
        return <VbsInteraction>{category: 'Browsing', type: ['resetAll'], timestamp: timestamp};
      case InteractionEventType.NAVIGATE:
        return <VbsInteraction>{category: 'Browsing', type: ['toolLayout'], value: component.context.get('n:component'), timestamp: timestamp};
      default:
        break;
    }
  }

  /**
   *
   * @param teamId
   * @param memberId
   */
  constructor(public readonly teamId: string, public readonly memberId: number) {
  }
}
