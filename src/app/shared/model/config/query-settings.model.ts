import {QueryConfig} from '../messages/interfaces/requests/query-config.interface';

export interface QuerySettings {
  /** The active query options. */
  options: { image: boolean, audio: boolean, model3d: boolean, motion: boolean, text: boolean, tag: boolean, bool: true }

  /** The default query config that should be used when submitting a Similarity or MLT query to Cineast. */
  config: QueryConfig;
}
