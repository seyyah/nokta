export class RollbackManager {
  rollbackCount = 0;
  maxRollbacks: number;

  constructor(maxRollbacks = 2) {
    this.maxRollbacks = maxRollbacks;
  }

  shouldRollback(failures: number): boolean {
    return failures >= this.maxRollbacks;
  }

  recordRollback() {
    this.rollbackCount += 1;
  }

  reset() {
    this.rollbackCount = 0;
  }
}
