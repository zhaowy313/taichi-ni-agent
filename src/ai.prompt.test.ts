import { describe, it, expect, vi } from 'vitest';
import { constructSystemPrompt } from './ai';

describe('constructSystemPrompt', () => {
  it('should construct prompt with context', () => {
    const context = [
      { text: 'Fact 1', metadata: { title: 'Book A' } },
      { text: 'Fact 2', metadata: { title: 'Book B' } }
    ];
    const prompt = constructSystemPrompt(context);
    
    expect(prompt).toContain('You are a Tai Chi master and expert in Ni Haixia\'s TCM philosophy.');
    expect(prompt).toContain('Context:\n- Fact 1 [Source: Book A]\n- Fact 2 [Source: Book B]');
    expect(prompt).toContain('When you use information from the context, please cite the source title');
  });

  it('should handle empty context', () => {
    const prompt = constructSystemPrompt([]);
    expect(prompt).toContain('Context:\n(No relevant context found)');
  });
});
