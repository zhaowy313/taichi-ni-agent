import { describe, it, expect, vi } from 'vitest';
import { constructSystemPrompt } from './ai';

describe('constructSystemPrompt', () => {
  it('should construct prompt with context', () => {
    const context = ['Fact 1', 'Fact 2'];
    const prompt = constructSystemPrompt(context);
    
    expect(prompt).toContain('You are a Tai Chi master and expert in Ni Haixia\'s TCM philosophy.');
    expect(prompt).toContain('Context:\n- Fact 1\n- Fact 2');
    expect(prompt).toContain('If the answer is not in the context, politely admit you do not know, but you can offer general encouragement based on Tai Chi principles if appropriate. Do not make up medical advice.');
  });

  it('should handle empty context', () => {
    const prompt = constructSystemPrompt([]);
    expect(prompt).toContain('Context:\n(No relevant context found)');
  });
});
