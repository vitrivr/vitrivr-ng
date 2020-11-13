import {LscResult} from './lsc-result.model';

export interface LscSubmission {
  memberId: number;
  timestamp: number;
  results?: LscResult[];
  resultSetAvailability: string;
  /* e.g. text, image, sketch, filter, browsing, cooperation*/
  usedCategories: string[];
  /* e.g. metadata, ocr, asr, concept, localizedObject, caption, jointEmbedding, custom, globalFeatures, localFeatures, feedbackModel*/
  usedTypes: string[];
  /* queries */
  values: string[];
  sortType: string[];
}
