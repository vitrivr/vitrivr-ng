/**
 * Simple helper to generated UUID's.
 *
 *
 * Taken from: https://jsfiddle.net/briguy37/2MVFd/
 */
export class UUIDGenerator {
  /**
   * Generates a new UUID and returns it.
   *
   * @return {string}
   */
  public static uuid() {
    let d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /**
   * Generates a new, short UUID and returns it.
   *
   * @return {string}
   */
  public static suid() {
    let d = new Date().getTime();
    return 'xxx-xxx-xxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
