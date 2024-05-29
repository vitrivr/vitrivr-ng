import {QueryContainerInterface} from '../../shared/model/queries/interfaces/query-container.interface';
import {EngineQueryUtil} from './engine-query.util';
import {QueryResult} from '../../../../openapi/vitrivr-engine';
import {TemporalObject} from '../../shared/model/misc/temporalObject';
import {TemporalQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-temporal.interface';
import {SimilarityQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-similarty.interface';
import {MediaObjectDescriptor, MediaObjectQueryResult, MediaSegmentDescriptor, MediaSegmentQueryResult, StringDoublePair} from '../../../../openapi/cineast';
import {ObjectMetadataQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-object-metadata.interface';

export class CineastCompat {
  static convert(containers: QueryContainerInterface[]) {
    /* containers are (temporal) stages */
    let query = EngineQueryUtil.generateInformationNeed();
    let outputOpName = '';
    containers.forEach((container, index) => {
      container.stages.forEach(value => {
        value.terms.forEach(term => {
          switch (term.type) {
            case 'IMAGE':
            case 'AUDIO':
            case 'MODEL3D':
            case 'LOCATION':
            case 'PARAMETERISED_LOCATION':
            case 'TIME':
            case 'TAG':
            case 'SEMANTIC':
            case 'SKELETON':
            case 'ID':
            case 'BOOLEAN':
              console.error('NOT SUPPORTED: Query Term: ', term)
              break;
            case 'TEXT':
              const category = term.categories[0]
              const inName = `in_${category}_${index}`
              const opName = `op_${category}_${index}`
              query.inputs[inName] = EngineQueryUtil.generateTextualInput(term.data)
              query.operations[opName] = EngineQueryUtil.generateRetrieverOperator(term.categories[0], inName)
              outputOpName = opName;
              break;
          }
        })
      })
    })

    const pathLookupName = "pathLookup"
    query.operations[pathLookupName] = EngineQueryUtil.generateFieldLookup(outputOpName)
    query.context.local[pathLookupName] = EngineQueryUtil.generatePathLookupContext()

    query.output = pathLookupName;
    return query;
  }

  static convertResultToTemporal(queryId: string, result: QueryResult){
    const tempObjs = result.retrievables.map(value => {
      return {score: value.score, objectId: value.id, segments: [value.id]} as TemporalObject
    })
    return {content: tempObjs, queryId: queryId} as TemporalQueryResult
  }

  static convertResultToSimilarity(queryId: string, result: QueryResult){
    const idScorePairs = result.retrievables.map(value => {
      return {key: value.id, value: value.score} as StringDoublePair
    })
    return {content: idScorePairs, queryId: queryId, count: result.retrievables.length, category: 'selection'} as SimilarityQueryResult
  }

  static convertResultToObject(queryId: string, result: QueryResult){
    const content = result.retrievables.map(it => {
      return {objectid: it.id, name: it.id, path: it.properties["path"], mediatype: 'IMAGE'} as MediaObjectDescriptor // TODO Far more logic
    })
    return {queryId: queryId, content: content} as MediaObjectQueryResult
  }

  static convertResultToSegment(queryId: string, result: QueryResult){
    const content = result.retrievables.map(it => {
      return {objectId: it.id, segmentId: it.id} as MediaSegmentDescriptor // TODO more logic
    })
    return {queryId: queryId, content: content} as MediaSegmentQueryResult
  }

  static convertResultToObjectMeta(queryId: string, result: QueryResult){
    return {} as ObjectMetadataQueryResult
  }
}
