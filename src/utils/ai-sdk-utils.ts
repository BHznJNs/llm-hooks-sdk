import type {
  FinishReason,
  GenerateTextResult,
  StreamTextResult,
  TextStreamPart,
} from 'ai';
import type { OpenAI } from '../types/openai.ts';
import { chatIdFactory } from './index.ts';
import { chunkBaseFactory, errorChunkFactory } from './openai.ts';

const finishReasonMap = new Map<
  FinishReason,
  OpenAI.ChatCompletionFinishReason
>([
  ['stop', 'stop'],
  ['length', 'length'],
  ['content-filter', 'content_filter'],
  ['tool-calls', 'tool_calls'],
  ['error', null],
  ['other', null],
  ['unknown', null],
]);

export function aiSdkChunkToOpenAIChunk(
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  chunk: TextStreamPart<{}>,
  chatId: string,
  model: string
):
  | OpenAI.ChatCompletionResponseChunk
  | OpenAI.ChatCompletionResponseErrorChunk
  | null {
  const chunkBase = chunkBaseFactory(chatId, model);
  switch (chunk.type) {
    case 'reasoning-start': {
      return {
        ...chunkBase,
        choices: [
          {
            index: 0 as const,
            delta: { role: 'assistant', content: '' },
            finish_reason: null,
          },
        ],
      };
    }
    case 'reasoning-delta': {
      return {
        ...chunkBase,
        choices: [
          {
            index: 0 as const,
            delta: {
              reasoning_content: chunk.text,
              content: '',
            } as any, // type assert to pass type check
            finish_reason: null,
          },
        ],
      };
    }
    case 'reasoning-end': {
      return {
        ...chunkBase,
        choices: [
          {
            index: 0 as const,
            delta: {
              reasoning_content: '',
              content: '',
            } as any, // type assert to pass type check
            finish_reason: null,
          },
        ],
      };
    }
    case 'text-start': {
      return {
        ...chunkBase,
        choices: [
          {
            index: 0 as const,
            delta: { role: 'assistant', content: '' },
            finish_reason: null,
          },
        ],
      };
    }
    case 'text-delta': {
      return {
        ...chunkBase,
        choices: [
          {
            index: 0 as const,
            delta: { content: chunk.text },
            finish_reason: null,
          },
        ],
      };
    }
    case 'text-end': {
      return {
        ...chunkBase,
        choices: [{ index: 0 as const, delta: {}, finish_reason: null }],
      };
    }
    case 'tool-input-start': {
      return {
        ...chunkBase,
        choices: [
          {
            index: 0 as const,
            delta: {
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  index: 0,
                  type: 'function',
                  id: chunk.id,
                  function: {
                    name: chunk.toolName,
                  },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      };
    }
    case 'tool-input-delta': {
      return {
        ...chunkBase,
        choices: [
          {
            index: 0 as const,
            delta: {
              tool_calls: [
                {
                  index: 0,
                  function: {
                    arguments: chunk.delta,
                  },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      };
    }
    case 'tool-input-end': {
      return {
        ...chunkBase,
        choices: [
          {
            index: 0 as const,
            delta: {},
            finish_reason: null,
          },
        ],
      };
    }
    case 'tool-call': {
      return {
        ...chunkBase,
        choices: [
          {
            index: 0 as const,
            delta: {
              tool_calls: [
                {
                  index: 0,
                  type: 'function',
                  id: chunk.toolCallId,
                  function: {
                    name: chunk.toolName,
                    arguments: chunk.input as string,
                  },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      };
    }
    case 'error': {
      return errorChunkFactory(chatId, model, chunk.error);
    }
    case 'finish': {
      const aiSdkUsageData = chunk.totalUsage;
      return {
        ...chunkBase,
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: finishReasonMap.get(chunk.finishReason) ?? null,
          },
        ],
        usage: {
          prompt_tokens: aiSdkUsageData.inputTokens ?? 0,
          completion_tokens: aiSdkUsageData.outputTokens ?? 0,
          total_tokens: aiSdkUsageData.totalTokens ?? 0,
        },
      };
    }
    default: {
      return null;
    }
  }
}

export function aiSdkStreamResultToOpenAIStream(
  model: string,
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  result: StreamTextResult<{}, string>
): ReadableStream<OpenAI.ChatCompletionResponseChunk> {
  const stream = new ReadableStream({
    async start(controller) {
      const chatId = chatIdFactory();
      try {
        for await (const chunk of result.fullStream) {
          const openaiChunk = aiSdkChunkToOpenAIChunk(chunk, chatId, model);
          if (openaiChunk === null) {
            continue;
          }
          controller.enqueue(openaiChunk);
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
  return stream;
}

export function aiSdkNonStreamResultToOpenAIResponse(
  model: string,
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  result: GenerateTextResult<{}, string>
): OpenAI.ChatCompletionResponse {
  const SECOND = 1000;
  const created = Math.floor(Date.now() / SECOND);
  return {
    id: `chatcmpl-${created}`,
    object: 'chat.completion',
    created,
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: result.text,
          refusal: null,
          tool_calls: result.toolCalls.map(
            (toolCall) =>
              ({
                id: toolCall.toolCallId,
                type: 'function',
                function: {
                  name: toolCall.toolName,
                  arguments: String(toolCall.input),
                },
              }) satisfies OpenAI.ChatCompletionResponseToolCall
          ),
        },
        finish_reason: finishReasonMap.get(result.finishReason) ?? 'stop',
        logprobs: null,
      },
    ],
    usage: {
      prompt_tokens: result.usage?.inputTokens || 0,
      completion_tokens: result.usage?.outputTokens || 0,
      total_tokens: result.usage?.totalTokens || 0,
    },
  };
}
