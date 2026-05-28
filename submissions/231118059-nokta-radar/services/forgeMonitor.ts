/**
 * forgeMonitor.ts
 * Forge cycle durumunu takip eder.
 * 2 üst üste FAIL veya ROLLBACK → STUCK tespiti.
 * Expert call trigger event'i emit eder.
 */

export type CycleResult = 'SUCCESS' | 'FAIL' | 'ROLLBACK' | 'STUCK';

export interface ForgeEvent {
  cycleId: string;
  result: CycleResult;
  timestamp: Date;
  screen?: string;
  hypothesis?: string;
}

type StuckListener = () => void;

class ForgeMonitor {
  private history: ForgeEvent[] = [];
  private stuckListeners: StuckListener[] = [];
  private consecutiveFailures = 0;
  private isStuck = false;

  /**
   * Bir cycle sonucunu kayıt et.
   * FAIL veya ROLLBACK arka arkaya 2 gelirse STUCK tetiklenir.
   */
  recordCycle(event: Omit<ForgeEvent, 'timestamp'>): void {
    const fullEvent: ForgeEvent = { ...event, timestamp: new Date() };
    this.history.push(fullEvent);

    if (event.result === 'FAIL' || event.result === 'ROLLBACK') {
      this.consecutiveFailures += 1;
      if (this.consecutiveFailures >= 2 && !this.isStuck) {
        this.isStuck = true;
        this.notifyStuck();
      }
    } else if (event.result === 'SUCCESS') {
      this.consecutiveFailures = 0;
      this.isStuck = false;
    }
  }

  /**
   * Manuel olarak STUCK durumunu sıfırla (expert call sonrası).
   */
  resolveStuck(): void {
    this.isStuck = false;
    this.consecutiveFailures = 0;
  }

  isCurrentlyStuck(): boolean {
    return this.isStuck;
  }

  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }

  getHistory(): ForgeEvent[] {
    return [...this.history];
  }

  getLastN(n: number): ForgeEvent[] {
    return this.history.slice(-n);
  }

  onStuck(listener: StuckListener): () => void {
    this.stuckListeners.push(listener);
    return () => {
      this.stuckListeners = this.stuckListeners.filter(l => l !== listener);
    };
  }

  private notifyStuck(): void {
    this.stuckListeners.forEach(l => l());
  }

  /**
   * Mevcut durumu FORGE.md formatında özetle.
   */
  getSummaryForForge(): string {
    const success = this.history.filter(e => e.result === 'SUCCESS').length;
    const rollback = this.history.filter(e => e.result === 'ROLLBACK').length;
    const fail = this.history.filter(e => e.result === 'FAIL').length;
    const total = this.history.length;
    const rate = total > 0 ? Math.round((success / total) * 100) : 0;

    return `| Toplam Cycle | ${total} |\n| SUCCESS | ${success} |\n| ROLLBACK | ${rollback} |\n| FAIL | ${fail} |\n| Başarı Oranı | %${rate} |\n| STUCK Tetiklendi | ${this.isStuck ? 'EVET' : 'HAYIR'} |`;
  }
}

// Singleton instance
export const forgeMonitor = new ForgeMonitor();
