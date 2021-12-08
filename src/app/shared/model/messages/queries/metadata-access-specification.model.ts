import {MetadataType} from './metadata-type.model';

export class MetadataAccessSpecification {

  constructor(public readonly type: MetadataType, public readonly domain: string, public readonly key: string) {
  }
}

