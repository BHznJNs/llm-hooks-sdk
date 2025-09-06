import type { OpenAI } from '../types/openai.ts';

export function openAiChunkBaseFactory(
  chatId: string,
  model: string
): OpenAI.ChatCompletionResponseBaseChunk {
  const SECOND = 1000;
  const created = Math.floor(Date.now() / SECOND);
  return {
    id: chatId,
    created,
    model,
    object: 'chat.completion.chunk',
  };
}

export function openAiErrorChunkFactory(
  chatId: string,
  model: string,
  error: unknown
): OpenAI.ChatCompletionResponseErrorChunk {
  const chunkBase = openAiChunkBaseFactory(chatId, model);
  const errorMessage: string =
    typeof error === 'object' && error !== null && 'message' in error
      ? (error.message as string)
      : JSON.stringify(error);
  return {
    ...chunkBase,
    choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
    error: {
      message: errorMessage,
      type: 'upstream_error',
    },
  };
}
