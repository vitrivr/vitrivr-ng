import {QueryContainerInterface} from '../../shared/model/queries/interfaces/query-container.interface';
import {EngineQueryUtil} from './engine-query.util';
import {QueryResult} from '../../../../openapi/vitrivr-engine';
import {TemporalObject} from '../../shared/model/misc/temporalObject';
import {TemporalQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-temporal.interface';
import {SimilarityQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-similarty.interface';
import {MediaObjectDescriptor, MediaObjectQueryResult, MediaSegmentDescriptor, MediaSegmentQueryResult, StringDoublePair} from '../../../../openapi/cineast';
import {ObjectMetadataQueryResult} from '../../shared/model/messages/interfaces/responses/query-result-object-metadata.interface';
import {BoolTerm} from '../../query/containers/bool/individual/bool-term';
import {BoolQueryTerm} from '../../shared/model/queries/bool-query-term.model';

export class CineastCompat {
  static convert(containers: QueryContainerInterface[]) {
    /* containers are (temporal) stages */
    let query = EngineQueryUtil.generateInformationNeed();
    let outputOpName = '';
    containers.forEach((container, qIndex) => {
      container.stages.forEach((value, sIndex) => {
        value.terms.forEach((term, tIndex) => {
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
              console.error('NOT SUPPORTED: Query Term: ', term)
              break;
            case 'BOOLEAN':
              const bcategory = "boolean"
              const binName = `in_${bcategory}_${qIndex}_${sIndex}_${tIndex}`
              const bopName = `op_${bcategory}_${qIndex}_${sIndex}_${tIndex}`
              query.inputs[binName] = EngineQueryUtil.generateBooleanInput((term as BoolQueryTerm).terms[0])
              const attribute = (term as BoolQueryTerm).terms[0].attribute
              query.operations[bopName] = EngineQueryUtil.generateBooleanRetrieverOperator(attribute, binName)
              outputOpName = bopName
              break;
            case 'TEXT':
              const category = term.categories[0]
              const inName = `in_${category}_${qIndex}_${sIndex}_${tIndex}`
              const opName = `op_${category}_${qIndex}_${sIndex}_${tIndex}`
              query.inputs[inName] = EngineQueryUtil.generateTextualInput(term.data)
              query.operations[opName] = EngineQueryUtil.generateRetrieverOperator(term.categories[0], inName)
              outputOpName = opName;
              break;
          }
        })
      })
    })


    const relationExpanderName = "relExp"
    query.operations[relationExpanderName] = EngineQueryUtil.buildRelationOperator(outputOpName)
    query.context.local[relationExpanderName] = EngineQueryUtil.buildRelationLookupContext()
    const relResName = "relRes"
    query.operations[relResName] = EngineQueryUtil.buildRelationResolverOperator(relationExpanderName)
    query.context.local[relResName] = EngineQueryUtil.buildRelationResolverContext()

    const pathLookupName = "pathLookup"
    query.operations[pathLookupName] = EngineQueryUtil.generateFieldLookup(relResName)
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
      const path = it.properties["path"]
      if(path){
        return {objectid: it.id, name: this.convertPathToItemName(path), path: path, mediatype: 'IMAGE'} as MediaObjectDescriptor // TODO Far more logic
      }else{
        return null
      }

    }).filter(it => it != null)
    return {queryId: queryId, content: content} as MediaObjectQueryResult
  }

  static convertResultToSegment(queryId: string, result: QueryResult){
    const content = result.retrievables.map(it => {
      if(it.properties["path"]){
        /* crude hack to filter day retrievables */
        return {objectId: it.id, segmentId: it.id, itemName: this.convertPathToItemName(it.properties["path"])} as MediaSegmentDescriptor // TODO more logic
      }else{
        return null
      }

    }).filter(it => it != null)
    return {queryId: queryId, content: content} as MediaSegmentQueryResult
  }

  static convertResultToObjectMeta(queryId: string, result: QueryResult){
    return {} as ObjectMetadataQueryResult
  }

  static convertPathToItemName(path: string){
    const pathSep = path.includes('\\') ? '\\' : '/'
    return path.substring(path.lastIndexOf(pathSep)+1, path.lastIndexOf('.'))
  }
}
