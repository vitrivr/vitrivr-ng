export type EventType = 'STARTED' | 'ENDED' | 'FEATURE_AVAILABLE';

export class EvaluationEvent {

  /**
   * Creates and returns a compact object representation of the EvaluationEvent (no
   * type). This representation can be used for serialisation.
   *
   * @param evaluation EvaluationEvent that should be serialised.
   * @return {{scenario: string, begin: Date, end: Date, k: number, events: EvaluationEvent[], ratings: Array, state: number, dcg: number, pAtK: number}}
   */
  public static serialise(evaluation: EvaluationEvent): any {
    return {
      queryId: evaluation.queryId,
      time: evaluation.time,
      type: evaluation.type,
      context: evaluation.context
    };
  }

  /**
   * Deserialises an EvaluationEvent from a plain JavaScript object. The field-names in the object must
   * correspond to the field names of the EvaluationEvent, without the _ prefix.
   *
   * @param object
   * @return {EvaluationEvent}
   */
  public static deserialise(object: any): EvaluationEvent {
    return new EvaluationEvent(object['queryId'], object['time'], object['type'], object['context']);
  }

  constructor(public readonly queryId: string, public readonly time: Date, public readonly type: EventType, public readonly context: string) {
  }
}
