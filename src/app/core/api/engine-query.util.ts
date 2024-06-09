import {InformationNeedDescription, InputData, OperatorDescription, QueryContext} from '../../../../openapi/vitrivr-engine';
import {QueryTerm} from '../../../../openapi/cineast';
import {BoolTerm} from '../../query/containers/bool/individual/bool-term';

export class EngineQueryUtil{
  static generateClipQuery(query: string){
    const ind = this.generateInformationNeed()
    const input = this.generateTextualInput(query)
    const clipOp = this.generateClipOp()
    const pathLookupCtx = this.generateFieldLookupContext("file", ["path"])
    const pathLookupOp = this.generateFieldLookup()

    ind.context.local["pathLookup_op"] = pathLookupCtx
    ind.inputs["clip_input"] = input
    clipOp["input"] = "clip_input"
    ind.operations["clip_op"] = clipOp
    pathLookupOp["input"] = "clip_op"
    ind.operations["pathLookup_op"] = pathLookupOp
    ind.output = "pathLookup_op"
    return ind;
  }

  static generatePathLookupContext(){
    return this.generateFieldLookupContext("file", ["path"]) // TODO read 'file' from config
  }

  static generateInformationNeed( outputOpName: string = ''){
    return {
      context: this.generateContext(),
      inputs: {},
      operations: {},
      output: outputOpName
    } as InformationNeedDescription
  }

  static generateOperators(ops: [string, OperatorDescription][]){
    return {operations: ops}
  }

  static generateInputs(inputs: [string, InputData]) {
    return {inputs: inputs}
  }

  static generateContext(){
    return {local: {}, global:{}} as QueryContext
  }

  static generateFieldLookupContext(fieldName: string, keys: string[]){
    return {field: fieldName, keys: keys.join(',')}
  }

  static generateFieldLookup(input: string = ''){
    return this.generateTransformerOperator('FieldLookup', input)
  }

  /**
   * Generates a textual {InputData} for the given text.
   * @param text The query text
   */
  static generateTextualInput(text: string){
    return { type: 'TEXT', data: text} as InputData
  }

  static generateBooleanInput(term: BoolTerm){
    return {type: 'TEXT', data: term.values[0], comparison: this.mapOperatorToComparison(term.operator)} as InputData
  }

  static buildRelationLookupContext(){
    return {incoming: "partOf"} as any
  }

  static buildRelationResolverContext(){
    return {predicate: "partOf"} as any
  }

  static buildRelationOperator(input: string){
    return {type: 'TRANSFORMER', transformerName: "RelationExpander", input: input} as OperatorDescription
  }

  static buildRelationResolverOperator(input: string){
    return {type: 'TRANSFORMER', transformerName: "RelationResolver", input: input} as OperatorDescription
  }

  static mapOperatorToComparison(op: string){
    switch(op){
      case "EQ": return "=="
      case "LIKE": return "~="
      case "GEQ": return ">="
      case "LEQ": return "<="
    }
  }

  static generateNumericalInput(number: number, comparison: string = '=='){
    return { type: 'NUMERIC', value: number, comparison:comparison } as InputData
  }

  /**
   * Generates an operatorDescription
   * @param fieldName The name of the field (from the engine-schema)
   * @param input The input-key, referencing this operator's input (default: empty, TBD)
   */
  static generateRetrieverOperator(fieldName: string, input: string = '') {
    return {type: 'RETRIEVER', field: fieldName, input: input} as OperatorDescription
  }

  static generateBooleanRetrieverOperator(fieldName: string, input: string = ''){
    return {type: 'RETRIEVER', field: fieldName, input: input} as OperatorDescription
  }

  static generateClipOp(){
    return this.generateRetrieverOperator('clip') // TODO load via config
  }

  static generateTransformerOperator(name: string, input: string = '') {
    return {type: 'TRANSFORMER', transformerName: name, input: input} as OperatorDescription
  }
}
