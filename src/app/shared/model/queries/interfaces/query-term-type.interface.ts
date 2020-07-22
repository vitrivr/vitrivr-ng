/**
 * QueryTerm types. If you want to add a new type, start by adding it here. For each type you must then provide a:
 *
 * - QueryTermInterface implementation
 * - QueryTermComponent implementation (see /app/query/components/)
 */
export type QueryTermType = 'IMAGE' | 'AUDIO' | 'MOTION' | 'MODEL3D' | 'MOTION' | 'TEXT' | 'TAG' | 'SEMANTIC' | 'POSE' | 'BOOLEAN';
export let QueryTermTypes: QueryTermType[] = ['IMAGE', 'AUDIO', 'MOTION', 'MODEL3D', 'MOTION', 'TEXT', 'TAG', 'SEMANTIC', 'POSE', 'BOOLEAN'];
