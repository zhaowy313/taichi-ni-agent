import { describe, it, expect } from 'vitest';
import { constructSystemPrompt } from './ai';

describe('constructSystemPrompt (Truncation)', () => {
  it('should truncate context if it exceeds limit', () => {
    const longText = 'A'.repeat(3000);
    const context = [
      { text: longText, metadata: { title: 'T1' } },
      { text: longText, metadata: { title: 'T2' } }
    ]; 
    const prompt = constructSystemPrompt(context);
    
    // Total prompt length should be reasonable (limit is roughly 4000-5000 in implementation)
    // We'll check if the resulting prompt is under a certain threshold or contains only parts of the context
    expect(prompt.length).toBeLessThan(6000);
    expect(prompt).toContain('Instructions:'); // Ensure instructions are still there
  });
});
