import { AllProvidersFailedError } from '@/types';
import { isRetryableStatus } from '../streaming';

describe('streaming utils', () => {
  it('429 retryable', () => expect(isRetryableStatus(429)).toBe(true));
  it('500 retryable', () => expect(isRetryableStatus(500)).toBe(true));
  it('503 retryable', () => expect(isRetryableStatus(503)).toBe(true));
  it('400 not retryable', () => expect(isRetryableStatus(400)).toBe(false));
  it('401 not retryable', () => expect(isRetryableStatus(401)).toBe(false));
});

describe('AllProvidersFailedError', () => {
  it('hangi provider\'ların hata verdiğini mesajda gösterir', () => {
    const e = new AllProvidersFailedError({ anthropic: '429', gemini: '500' });
    expect(e.message).toContain('anthropic');
    expect(e.message).toContain('gemini');
    expect(e.name).toBe('AllProvidersFailedError');
  });
});
