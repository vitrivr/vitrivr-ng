export type Lines = Record<string, number[]>;

export type Graph = Record<string, number[]>;

export interface SkelSpecDatum {
  lines: Lines;
  names: string[];
  graph: Graph;
  digraph: Graph;
  max_kp: number;
}

export type SkelSpecData = Record<string, SkelSpecDatum>
