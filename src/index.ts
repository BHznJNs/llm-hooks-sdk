// biome-ignore lint/performance/noBarrelFile: export utility functions from AI SDK
export { generateText, streamText } from "ai";

import { randomUUID } from "node:crypto";
export const chatIdFactory = () => `chatcmpl-${randomUUID()}`;

export * from "./types/index.ts";
