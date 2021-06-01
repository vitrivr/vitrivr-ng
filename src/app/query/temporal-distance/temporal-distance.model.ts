export type TemporalQualifier = 'LESS' | 'LESS_OR_EQUAL' | 'GREATER' | 'GREATER_OR_EQUAL';

export class TemporalDistance {
  /** Temporal distance in seconds **/
  public readonly distance: number;
  public readonly qualifier: TemporalQualifier;

  constructor(distance: number, qualifier: TemporalQualifier) {
    this.distance = distance;
    this.qualifier = qualifier;
  }

  /**
   * Returns true if the given time matches this temporal distance.
   * <br>
   * All values are treated as seconds, however as long as both (this distance) and the input have the same unit, it works with others as well.
   * <br>
   *   Example: given this TemporalDistance is of value 30s and with the qualifier less, the return value of this function is time < 30s
   * @param time The time to evaluete with this temporal distance in seconds.
   * @returns Whether the time is within this temporal distance.
   */
  public matchesTemporally(time: number): boolean {
    switch (this.qualifier) {
      case 'GREATER':
        return time > this.distance;
      case 'GREATER_OR_EQUAL':
        return time >= this.distance;
      case 'LESS':
        return time < this.distance;
      case 'LESS_OR_EQUAL':
        return time <= this.distance;
    }
  }
}
