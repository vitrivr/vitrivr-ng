export class SegmentScoreLogContainer {
  public readonly objectId: string;
  public readonly segmentId: string;
  public readonly startabs: number;
  public readonly endabs: number;
  public readonly _score: number;

  constructor(objectId: string, segmentId: string, startabs: number, endabs: number, score: number) {
    this.objectId = objectId;
    this.segmentId = segmentId;
    this.startabs = startabs;
    this.endabs = endabs;
    this._score = score;
  }
}