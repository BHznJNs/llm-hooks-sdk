import type { Logger } from 'pino';
import type { LlmModel, ProviderOptions } from './ai-sdk.ts';
import type { PromiseOr } from './index.ts';
import type { OpenAI } from './openai.ts';

export type PluginArguments<T> = {
  data: T;
  chatId: string;
  logger: Logger;
  model: LlmModel;
  metadata: Record<string, unknown>;
};

export type Plugin = Partial<{
  beforeUpstreamRequest: (
    args: PluginArguments<{
      requestParams: OpenAI.ChatCompletionRequest;
      providerOptions: ProviderOptions;
    }>
  ) => PromiseOr<{
    requestParams: OpenAI.ChatCompletionRequest;
    providerOptions?: ProviderOptions;
  } | null>;
  onUpstreamChunk: (
    args: PluginArguments<OpenAI.ChatCompletionResponseChunk>
  ) => PromiseOr<OpenAI.ChatCompletionResponseChunk | null>;
  afterUpstreamResponse: (
    args: PluginArguments<OpenAI.ChatCompletionResponse | string>,
    isStream: boolean
  ) => PromiseOr<
    | OpenAI.ChatCompletionResponse
    | ReadableStream<
        | OpenAI.ChatCompletionResponseChunk
        | OpenAI.ChatCompletionResponseErrorChunk
      >
    | null
  >;
  onFetchModelList: (
    args: PluginArguments<OpenAI.ModelListResponse>
  ) => PromiseOr<OpenAI.ModelListResponse | null>;
}>;

export type HookType = keyof Plugin;
