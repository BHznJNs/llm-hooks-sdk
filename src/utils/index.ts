import { randomUUID } from 'node:crypto';
export const chatIdFactory = () => `chatcmpl-${randomUUID()}`;
