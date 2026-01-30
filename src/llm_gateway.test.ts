import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveProvider, constructGatewayUrl } from './llm_gateway';
import { Env } from './types';

describe('LLM Gateway Logic', () => {
  const mockEnv = {
    CF_AIGATEWAY_ACCOUNT_ID: 'test-account',
    CF_AIGATEWAY_SLUG: 'test-gateway',
  } as unknown as Env;

  describe('resolveProvider', () => {
    it('should resolve gpt-4o to openai', () => {
      expect(resolveProvider('gpt-4o')).toBe('openai');
    });

    it('should resolve gemini-1.5-pro to google-ai-studio', () => {
      expect(resolveProvider('gemini-1.5-pro')).toBe('google-ai-studio');
    });

    it('should resolve deepseek-chat to deepseek', () => {
      expect(resolveProvider('deepseek-chat')).toBe('deepseek');
    });

    it('should default to openai for unknown models', () => {
      expect(resolveProvider('unknown-model')).toBe('openai');
    });
  });

  describe('constructGatewayUrl', () => {
    it('should construct correct URL for openai', () => {
      const url = constructGatewayUrl('openai', mockEnv);
      expect(url).toBe('https://gateway.ai.cloudflare.com/v1/test-account/test-gateway/openai/chat/completions');
    });

    it('should construct correct URL for google-ai-studio (using openai compatibility path)', () => {
      // Note: Google AI Studio via Gateway often supports OpenAI format if configured, 
      // otherwise we might need specific paths. For this MVP, we assume the Gateway handles the translation 
      // or we use the OpenAI-compatible endpoint that Gateway exposes for it.
      const url = constructGatewayUrl('google-ai-studio', mockEnv);
      expect(url).toBe('https://gateway.ai.cloudflare.com/v1/test-account/test-gateway/google-ai-studio/chat/completions');
    });
  });
});
