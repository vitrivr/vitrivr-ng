import skelsRaw from './skels.json';
import { SkelSpecDatum, SkelSpecData } from './skels.interface';

// @ts-ignore
const skels: SkelSpecData = skelsRaw as SkelSpecData;

export class SkelSpec {
  private static instances: Record<string, SkelSpec> = {};
  public modeName: string;
  private skelType: SkelSpecDatum;
  public nodes: number[] = [];
  public edges: [number, number][] = [];
  public diedges: [number, number][] = [];

  static specs(): SkelSpec[] {
    return SkelSpec.modeNames().map(SkelSpec.get);
  }

  static modeNames(): string[] {
    const modes: string[] = [];
    for (const mode of Object.keys(skels)) {
      if (mode.startsWith('__')) {
        continue;
      }
      modes.push(mode);
    }
    return modes;
  }

  public static get(modeName: string) {
    if (!SkelSpec.instances.hasOwnProperty(modeName)) {
      SkelSpec.instances[modeName] = new SkelSpec(modeName);
    }
    return SkelSpec.instances[modeName];
  }

  constructor(modeName: string) {
    this.modeName = modeName;
    this.skelType = skels[modeName];

    for (const [k, vs] of Object.entries(this.skelType.graph)) {
      const kNum = parseInt(k, 10);
      this.nodes.push(kNum);
      for (const v of vs) {
        this.nodes.push(v);
        this.edges.push([kNum, v]);
        this.diedges.push([kNum, v]);
        this.diedges.push([v, kNum]);
      }
    }
    this.nodes.sort();
  }

  public hasKpIdx(kpIdx: number): boolean {
    return this.skelType.digraph.hasOwnProperty(kpIdx.toString());
  }

  public hasEdge(kp1: number, kp2: number) {
    return (
      this.hasKpIdx(kp1) &&
      this.skelType.digraph[kp1.toString()].indexOf(kp2) !== -1
    );
  }

  public hasAll(pose: number[][]): boolean {
    if (pose === null) {
      return false;
    }
    for (const kpIdx of this.nodes) {
      if (pose[kpIdx][2] <= 0) {
        return false;
      }
    }
    return true;
  }
}
