// simple progress bus for SSE
import { EventEmitter } from 'events';
export type ProgressEvent = { phase: string; detail?: string; progress?: number };
export const bus = new EventEmitter();
