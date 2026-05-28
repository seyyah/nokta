export class RetryManager {
  retryCount = 0;
  maxRetries: number;

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
  }

  shouldRetry(lastState: string): boolean {
    return lastState === 'FAIL' && this.retryCount < this.maxRetries;
  }

  recordRetry() {
    this.retryCount += 1;
  }

  reset() {
    this.retryCount = 0;
  }
}
