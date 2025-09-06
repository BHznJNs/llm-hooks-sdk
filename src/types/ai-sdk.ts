import type { AnthropicProvider } from '@ai-sdk/anthropic';
import type { GoogleGenerativeAIProvider } from '@ai-sdk/google';
import type { OpenAIProvider } from '@ai-sdk/openai';

export type { GenerateTextResult, StreamTextResult } from 'ai';

export type ProviderOptions = Record<string, unknown>;

export type LlmProvider = 'openai' | 'google' | 'anthropic';
export type LlmClient =
  | AnthropicProvider
  | GoogleGenerativeAIProvider
  | OpenAIProvider;
export type LlmModel = ReturnType<LlmClient['chat']>;
