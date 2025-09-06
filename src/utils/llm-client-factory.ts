import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import type { LlmClient, LlmProvider } from '../types/ai-sdk.ts';

export function llmClientFactory(
  provider: LlmProvider,
  apiKey: string,
  baseUrl?: string
): LlmClient {
  let upstreamEndpoint: string | undefined;
  if (baseUrl === undefined) {
    upstreamEndpoint = undefined;
  } else if (baseUrl.endsWith('/')) {
    upstreamEndpoint = baseUrl;
  } else {
    upstreamEndpoint = `${baseUrl}/`;
  }

  switch (provider) {
    case 'google':
      return createGoogleGenerativeAI({
        apiKey,
        baseURL: upstreamEndpoint,
      });
    case 'anthropic':
      return createAnthropic({
        apiKey,
        baseURL: upstreamEndpoint,
      });
    case 'openai':
      return createOpenAI({
        apiKey,
        baseURL: upstreamEndpoint,
      });
  }
}
