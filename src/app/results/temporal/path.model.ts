import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';

export class Path {
  /**
   * @param pathMap Map <containerID, segment>
   */
  constructor(public readonly pathMap: Map<number, SegmentScoreContainer>) {
  }

  public key(): string {
    return this.toString();
  }

  public toString(): string {
    let _return = '';
    this.pathMap.forEach((segment, containerID) => _return = _return + '-' + segment.segmentId + '.' + containerID);
    return _return;
  }
}
