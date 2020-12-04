export type EventCategory = 'Text' | 'Image' | 'Sketch' | 'Filter' | 'Browsing' | 'Cooperation' | 'Custom';
export const EventCategories: EventCategory[] = ['Text', 'Image', 'Sketch', 'Filter', 'Browsing', 'Cooperation', 'Custom'];

/* */
export const CategoryTypeMap = new Map<string, string[]>();
CategoryTypeMap.set('Text', ['metadata', 'OCR', 'ASR', 'concept', 'localizedObject', 'caption']);
CategoryTypeMap.set('Image', ['globalFeatures', 'localFeatures', 'feedbackModel']);
CategoryTypeMap.set('Sketch', ['color', 'edge', 'motion', 'semanticSegmentation']);
CategoryTypeMap.set('Filter', ['b/w', 'dominantColor', 'resolution']);
CategoryTypeMap.set('Browsing', ['rankedList', 'videoSummary', 'temporalContext', 'videoPlayer', 'exploration', 'toolLayout', 'explicitSort', 'resetAll']);
CategoryTypeMap.set('Cooperation', []);
CategoryTypeMap.set('Custom', ['ResultSetStatistics', 'AddTagFromResultInfo', 'LoadFeatures']);
