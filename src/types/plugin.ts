import type { OpenAIProvider } from "@ai-sdk/openai";
import type { Logger } from "pino";
import type { OpenAI } from "./openai.ts";

export type LlmModel = ReturnType<OpenAIProvider["chat"]>;
export type ProviderOptions = Record<string, unknown>;

export type PluginArguments<T> = {
  data: T;
  logger: Logger;
  model: LlmModel;
  config: Record<string, unknown>;
};

export type Plugin = Partial<{
  beforeUpstreamRequest: (
    args: PluginArguments<{
      requestParams: OpenAI.ChatCompletionRequest;
      providerOptions: ProviderOptions;
    }>
  ) => {
    requestParams: OpenAI.ChatCompletionRequest;
    providerOptions?: ProviderOptions;
  };
  onUpstreamChunk: (
    args: PluginArguments<OpenAI.ChatCompletionResponseChunk>
  ) => OpenAI.ChatCompletionResponseChunk | null;
  afterUpstreamResponse: (
    args: PluginArguments<OpenAI.ChatCompletionResponse | string>,
    isStream: boolean
  ) =>
    | OpenAI.ChatCompletionResponse
    | ReadableStream<
        | OpenAI.ChatCompletionResponseChunk
        | OpenAI.ChatCompletionResponseErrorChunk
      >;
  onFetchModelList: (
    args: PluginArguments<OpenAI.ModelListResponse>
  ) => OpenAI.ModelListResponse;
}>;
