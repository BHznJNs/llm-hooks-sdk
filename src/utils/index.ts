/** biome-ignore-all lint/performance/noBarrelFile: export AI SDK and OpenAI utility functions */

import { randomUUID } from 'node:crypto';
export const chatIdFactory = () => `chatcmpl-${randomUUID()}`;

export * from './ai-sdk-utils.ts';
export * from './openai.ts';
