import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParams,
  ChatCompletionMessageToolCall,
  ChatCompletionTool as ChatCompletionTool_,
  Model,
} from 'openai/resources';

type BaseChunk = {
  id: string;
  created: number;
  model: string;
  object: 'chat.completion.chunk';
};

type ErrorChunk = {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: [
    {
      index: 0;
      // biome-ignore lint/complexity/noBannedTypes: here is a fixed empty object
      delta: {};
      finish_reason: 'stop';
    },
  ];
  error: {
    message: string;
    type: string;
  };
};

// biome-ignore lint/style/noNamespace: Exposes the OpenAI type definitions to the global
export namespace OpenAI {
  export type ChatCompletionRequest = ChatCompletionCreateParams;
  export type ChatCompletionResponse = ChatCompletion;
  export type ChatCompletionResponseBaseChunk = BaseChunk;
  export type ChatCompletionResponseChunk = ChatCompletionChunk;
  export type ChatCompletionResponseErrorChunk = ErrorChunk;
  export type ChatCompletionTool = ChatCompletionTool_;
  export type ChatCompletionResponseToolCall = ChatCompletionMessageToolCall;
  export type ChatCompletionFinishReason =
    | 'stop'
    | 'length'
    | 'tool_calls'
    | 'content_filter'
    | 'function_call'
    | null;

  export type ModelListResponse = {
    data: Model[];
  };
}
