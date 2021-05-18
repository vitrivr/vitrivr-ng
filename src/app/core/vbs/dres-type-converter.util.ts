import {Observable} from 'rxjs';
import {InteractionEventType} from '../../shared/model/events/interaction-event-type.model';
import {InteractionEvent} from '../../shared/model/events/interaction-event.model';
import {WeightedFeatureCategory} from '../../shared/model/results/weighted-feature-category.model';
import {catchError, filter} from 'rxjs/operators';
import {InteractionEventComponent} from '../../shared/model/events/interaction-event-component.model';
import {QueryEvent, QueryEventLog, QueryResult, QueryResultLog} from '../../../../openapi/dres';
import {map} from 'rxjs/internal/operators/map';
import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';

/**
 * Utility  class for converting {InteractionEvent}s to {QueryEventLog} used by DRES.
 */
export class DresTypeConverter {

  /**
   * This method maps the events emitted on the Vitrivr NG EventBusService to VbsActions.
   *
   * @param {Observable<Interaction>} stream The observable of the InteractionEvents as exposed by the EventBusService
   */
  public static mapEventStream(stream: Observable<InteractionEvent>): Observable<QueryEventLog> {
    return stream.pipe(
      map(e => {
        return <QueryEventLog>{timestamp: e.timestamp, events: e.components.map(c => DresTypeConverter.mapAtomicEvent(c, e.timestamp)).filter(c => c != null)};
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
  public static mapAtomicEvent(component: InteractionEventComponent, timestamp: number): QueryEvent {
    switch (component.type) {
      case InteractionEventType.QUERY_MODEL3D:
      case InteractionEventType.QUERY_BOOLEAN:
      case InteractionEventType.HIGHLIGHT:
      case InteractionEventType.QUERY_AUDIO:
        console.warn(`interaction logging for ${component.type} is unsupported`)
        break;
      case InteractionEventType.PLAY:
        return <QueryEvent>{category: 'BROWSING', type: 'videoPlayer', value: component.context.get('i:mediaobject') + ': ' + component.context.get('i:starttime'), timestamp: timestamp}
      case InteractionEventType.NEW_QUERY_STAGE:
      case InteractionEventType.NEW_QUERY_CONTAINER:
        break;
      case InteractionEventType.QUERY_MOTION:
        return <QueryEvent>{category: 'SKETCH', type: 'motion', timestamp: timestamp};
      case InteractionEventType.QUERY_SEMANTIC:
        return <QueryEvent>{category: 'SKETCH', type: 'semanticSegmentation', timestamp: timestamp};
      case InteractionEventType.MLT:
        return <QueryEvent>{category: 'IMAGE', type: 'globalFeatures', value: 'mlt', timestamp: timestamp};
      case InteractionEventType.QUERY_TAG:
        return <QueryEvent>{category: 'TEXT', type: 'concept', timestamp: timestamp};
      case InteractionEventType.QUERY_FULLTEXT: {
        const c = component.context.get('q:categories');
        const types = [];
        if (c.indexOf('ocr') > -1) {
          types.push('ocr');
        }
        if (c.indexOf('asr') > -1) {
          types.push('asr');
        }
        if (c.indexOf('meta') > -1) {
          types.push('metadata');
        }
        if (c.indexOf('tagsft') > -1) {
          types.push('concept');
        }
        if (c.indexOf('scenecaption') > -1) {
          types.push('caption');
        }
        if (c.indexOf('audio') > -1) {
          types.push('custom');
        }
        return <QueryEvent>{category: 'TEXT', value: types.join(','), timestamp: timestamp};
      }
      case InteractionEventType.QUERY_IMAGE: {
        const c = component.context.get('q:categories');
        const types = [];
        if ((c.indexOf('localfeatures') === -1)) {
          if (c.indexOf('globalcolor') > -1 || c.context.get('q:categories').indexOf('localcolor') > -1) {
            types.push('color');
          }
          if (c.indexOf('edge') > -1) {
            types.push('edge');
          }
          return <QueryEvent>{category: 'SKETCH', value: types.join(','), timestamp: timestamp};
        } else {
          types.push('localFeatures', 'globalFeatures');
          return <QueryEvent>{category: 'IMAGE', value: types.join(','), timestamp: timestamp};
        }
      }
      case InteractionEventType.FILTER:
        return <QueryEvent>{category: 'FILTER', type: component.context.get('f:type'), timestamp: timestamp};
      case InteractionEventType.EXPAND:
        return <QueryEvent>{category: 'BROWSING', type: 'temporalContext', timestamp: timestamp};
      case InteractionEventType.REFINE:
        const weights = component.context.get('w:weights').map((v: WeightedFeatureCategory) => v.name + ':' + v.weightPercentage / 100).join(',');
        return <QueryEvent>{category: 'BROWSING', type: 'explicitSort', value: 'adjust weights,' + weights, timestamp: timestamp};
      case InteractionEventType.EXAMINE:
        return <QueryEvent>{category: 'BROWSING', type: 'videoPlayer', value: component.context.get('i:mediasegment'), timestamp: timestamp};
      case InteractionEventType.SCROLL:
        return <QueryEvent>{category: 'BROWSING', type: 'rankedList', timestamp: timestamp};
      case InteractionEventType.CLEAR:
        return <QueryEvent>{category: 'BROWSING', type: 'resetAll', timestamp: timestamp};
      case InteractionEventType.NAVIGATE:
        return <QueryEvent>{category: 'BROWSING', type: 'toolLayout', timestamp: timestamp};
      default:
        break;
    }
  }

  /**
   * Maps a list of {SegmentScoreContainer}s to a {QueryResultLog}.
   *
   * @param context A UI context identifier.
   * @param list The list of {SegmentScoreContainer}s to convert.
   * @param event the interaction event of the query associated with the resultset.
   * @return {QueryResultLog}
   */
  public static mapSegmentScoreContainer(context: string, list: MediaSegmentScoreContainer[], event: InteractionEvent): QueryResultLog {
    return <QueryResultLog>{timestamp: Date.now(),
      sortType: context,
      resultSetAvailability: 'top',
      results: list.map((s, i) => <QueryResult>{item: s.objectId, segment: s.sequenceNumber, score: s.score, rank: i}),
      events: event.components.map(e => DresTypeConverter.mapAtomicEvent(e, event.timestamp)).filter(e => e != null)
    }

    /* TODO: What happens with all the category stuff?*/
    /* event.components.forEach(component => {
      if (component.type === InteractionEventType.NEW_QUERY_CONTAINER) {
        results.values.push('NEW_QUERY_CONTAINER')
        return;
      }
      if (component.type === InteractionEventType.NEW_QUERY_STAGE) {
        results.values.push('NEW_QUERY_STAGE')
        return;
      }
      (component.context.get('q:categories') as string[]).forEach(c => {
        const category = VbsResultsLog.featureCategoryToVbsCategory(c);
        const type = VbsResultsLog.featureCategoryToVbsType(c);
        if (category != null && results.usedCategories.indexOf(category) === -1) {
          results.usedCategories.push(category)
        }
        if (type != null && results.usedTypes.indexOf(type) === -1) {
          results.usedTypes.push(type)
        }
      })
      results.values.push(JSON.stringify(component.context.get('q:categories')))
      results.values.push(JSON.stringify(component.context.get('q:value')))
    })
    results.sortType.push(context);
    list.forEach((segmentScoreContainer, index) => {
      results.results.push(<VbsResult>{
        video: segmentScoreContainer.objectId,
        shot: segmentScoreContainer.sequenceNumber,
        score: segmentScoreContainer.score,
        rank: index
      });
      segmentScoreContainer.scores.forEach((categoryScoreMap, containerId) => {
        categoryScoreMap.forEach((score, feature) => {
          const category = this.featureCategoryToVbsCategory(feature.name);
          const type = this.featureCategoryToVbsType(feature.name);
          if (category != null && results.usedCategories.indexOf(category) === -1) {
            results.usedCategories.push(category)
          }
          if (type != null && results.usedTypes.indexOf(type) === -1) {
            results.usedTypes.push(type)
          }
        });
      })
    });

    return results*/
  }

  /**
   * Maps vitrivr feature categories to the VBS category.
   *
   * @param category
   */
  public static featureCategoryToVbsCategory(category: string): string {
    switch (category) {
      case 'ocr':
      case 'asr':
      case 'meta':
      case 'tagsft':
      case 'tags':
      case 'scenecaption':
      case 'boolean':
        return 'TEXT';
      case 'semantic':
      case 'motion':
      case 'edge':
      case 'globalcolor':
      case 'localcolor':
        return 'SKETCH';
      case 'localfeatures':
      case 'localfeatures_fast':
        return 'IMAGE';
      default:
        return null;
    }
  }

  /**
   * Maps vitrivr feature categories to the VBS type.
   *
   * @param category
   */
  public static featureCategoryToVbsType(category: string): string {
    switch (category) {
      case 'ocr':
        return 'OCR';
      case 'asr':
        return 'ASR';
      case 'meta':
        return 'metadata';
      case 'tagsft':
      case 'tags':
        return 'concept';
      case 'scenecaption':
        return 'caption';
      case 'boolean':
        return 'metadata';
      case 'semantic':
        return 'semanticSegmentation';
      case 'motion':
        return 'motion';
      case 'edge':
        return 'edge';
      case 'globalcolor':
      case 'localcolor':
        return 'color';
      case 'localfeatures':
      case 'localfeatures_fast':
        return 'localFeatures';
      default:
        return null;
    }
  }

}
