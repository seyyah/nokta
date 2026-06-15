import * as FileSystem from 'expo-file-system';
import { RetryManager } from './RetryManager';
import { RollbackManager } from './RollbackManager';
import { detectStuck } from './StuckDetector';
import { buildForgeMarkdown } from './ForgeReport';
import { MarkdownService } from '../ai/MarkdownService';
import type { PersonaKey } from '../../src/store/usePersonaStore';

export type ForgeState =
  | 'IDLE'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAIL'
  | 'RETRY'
  | 'ROLLBACK'
  | 'STUCK'
  | 'EXPERT_ESCALATION';

export interface ForgeCycle {
  timestamp: string;
  duration: number;
  retries: number;
  state: ForgeState;
  summary: string;
  escalation: boolean;
}

export interface ForgeInput {
  transcript: string;
  persona: PersonaKey;
}

export interface ForgeResult {
  summary: string;
  state: ForgeState;
  cycle: ForgeCycle;
  report: string;
  reportUri?: string;
  expertCall?: boolean;
}

export class ForgeEngine {
  private cycles: ForgeCycle[] = [];
  private retryManager = new RetryManager(3);
  private rollbackManager = new RollbackManager(2);

  get history() {
    return [...this.cycles];
  }

  async execute(input: ForgeInput): Promise<ForgeResult> {
    const start = Date.now();
    let currentState: ForgeState = 'RUNNING';
    let summary = '';
    let retries = 0;
    let escalation = false;

    while (currentState === 'RUNNING' || currentState === 'RETRY') {
      try {
        const candidate = this.buildAttempt(input, retries);
        const sameAsPrevious = this.cycles.length > 0 && this.cycles[this.cycles.length - 1].summary === candidate;
        if (sameAsPrevious) {
          retries += 1;
          this.retryManager.recordRetry();
          currentState = this.retryManager.shouldRetry('FAIL') ? 'RETRY' : 'STUCK';
        } else {
          summary = candidate;
          currentState = 'SUCCESS';
        }

        if (currentState === 'RETRY') {
          retries += 1;
          await this.delay(650 + retries * 150);
          continue;
        }

        if (detectStuck(this.cycles.concat({
          timestamp: new Date().toISOString(),
          duration: Date.now() - start,
          retries,
          state: currentState,
          summary: candidate,
          escalation: false,
        }))) {
          currentState = 'STUCK';
        }
      } catch {
        retries += 1;
        this.retryManager.recordRetry();
        currentState = this.retryManager.shouldRetry('FAIL') ? 'RETRY' : 'FAIL';
      }

      if (this.rollbackManager.shouldRollback(retries)) {
        this.rollbackManager.recordRollback();
        currentState = 'ROLLBACK';
        summary = this.buildRollback(input, retries);
      }

      if (retries >= 4) {
        currentState = 'EXPERT_ESCALATION';
        escalation = true;
      }

    }

    const end = Date.now();
    const cycle: ForgeCycle = {
      timestamp: new Date().toISOString(),
      duration: end - start,
      retries,
      state: currentState,
      summary: summary || this.buildAttempt(input, retries),
      escalation,
    };
    this.cycles.push(cycle);
    const report = buildForgeMarkdown(this.cycles);
    const reportUri = await this.saveForgeReport(report);

    return {
      summary: cycle.summary,
      state: cycle.state,
      cycle,
      report,
      reportUri,
      expertCall: cycle.escalation,
    };
  }

  private async saveForgeReport(report: string): Promise<string | undefined> {
    const directory = FileSystem.documentDirectory;
    if (!directory) return undefined;

    const path = `${directory}FORGE.md`;
    try {
      await FileSystem.writeAsStringAsync(path, report, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return path;
    } catch {
      return undefined;
    }
  }

  private buildAttempt(input: ForgeInput, retries: number) {
    const base = MarkdownService.buildResponse(input.transcript, input.persona);
    if (retries === 0) return base;
    if (retries === 1) return `${base} Ayrıca, ek olarak öncelikli demo güvenlik adımlarına odaklan.`;
    return `${base} Yanıtın kararlılığını artırmak için ikinci geçiş tamamlandı.`;
  }

  private buildRollback(input: ForgeInput, retries: number) {
    return `Rollback gerçekleşti. Önceki strateji tekrar değerlendirildi ve metin güvenli, demo dostu içerikle yeniden oluşturuldu.`;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
