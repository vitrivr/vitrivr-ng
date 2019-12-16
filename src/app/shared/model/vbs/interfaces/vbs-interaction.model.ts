import {EventCategory} from './event-category.model';

/**
 * An Interaction.
 */
export interface VbsInteraction {
    category: EventCategory;
    type: string[];
    value?: string;
    attributes?: string;
}

