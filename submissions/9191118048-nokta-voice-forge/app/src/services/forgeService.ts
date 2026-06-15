/**
 * Nokta Voice Forge — Forge Cycle State Machine Service
 * Manages the READ→LOCATE→HYPOTHESIZE→REPAIR→TEST→VERIFY→COMMIT/ROLLBACK lifecycle
 */

import { ForgeCycle, ForgePhase, ForgeResult, ForgeState } from '../types';
import StorageService from './storageService';

const PHASE_ORDER: ForgePhase[] = [
  'READ',
  'LOCATE',
  'HYPOTHESIZE',
  'REPAIR',
  'TEST',
  'VERIFY',
];

const STUCK_THRESHOLD = 2;

function generateCommitHash(): string {
  const chars = 'abcdef0123456789';
  let hash = '';
  for (let i = 0; i < 7; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function buildPhases(
  upToPhase: ForgePhase,
  finalStatus: 'done' | 'failed' = 'done'
): ForgeCycle['phases'] {
  const phases: ForgeCycle['phases'] = [];
  for (let i = 0; i < PHASE_ORDER.length; i++) {
    const phase = PHASE_ORDER[i];
    const isTarget = phase === upToPhase;
    const isPast = PHASE_ORDER.indexOf(phase) < PHASE_ORDER.indexOf(upToPhase);

    let status: 'pending' | 'active' | 'done' | 'failed';
    if (isPast) {
      status = 'done';
    } else if (isTarget) {
      status = finalStatus;
    } else {
      status = 'pending';
    }

    phases.push({
      phase,
      status,
      notes: status === 'done' ? `${phase} tamamlandı` : '',
      timestamp: status !== 'pending' ? minutesAgo(30 - i * 4) : '',
    });
  }
  return phases;
}

function buildCompletedPhases(commitOrRollback: 'COMMIT' | 'ROLLBACK'): ForgeCycle['phases'] {
  const phases: ForgeCycle['phases'] = PHASE_ORDER.map((phase, i) => ({
    phase,
    status: 'done' as const,
    notes: `${phase} tamamlandı`,
    timestamp: minutesAgo(30 - i * 4),
  }));

  phases.push({
    phase: commitOrRollback,
    status: 'done',
    notes: commitOrRollback === 'COMMIT' ? 'Değişiklikler commit edildi' : 'Değişiklikler geri alındı',
    timestamp: minutesAgo(2),
  });

  return phases;
}

function createDemoCycles(): ForgeCycle[] {
  return [
    {
      id: 1,
      reportName: 'audit-report-001.md',
      hypothesis: 'Kullanıcı giriş ekranında doğrulama hatası var — regex düzeltmesi gerekli',
      result: 'SUCCESS',
      changedFiles: ['src/screens/LoginScreen.tsx', 'src/utils/validation.ts'],
      testResult: '✅ 12/12 test geçti',
      commitHash: 'a3f8c21',
      kg: 1.2,
      humanTouchPoints: 0,
      startTime: minutesAgo(180),
      endTime: minutesAgo(165),
      currentPhase: 'COMMIT',
      phases: buildCompletedPhases('COMMIT'),
      durationMinutes: 15,
    },
    {
      id: 2,
      reportName: 'audit-report-002.md',
      hypothesis: 'API timeout değeri çok düşük — 10s yerine 30s yapılmalı',
      result: 'SUCCESS',
      changedFiles: ['src/services/apiClient.ts', 'src/config/constants.ts'],
      testResult: '✅ 8/8 test geçti',
      commitHash: 'b7e2d44',
      kg: 2.5,
      humanTouchPoints: 0,
      startTime: minutesAgo(160),
      endTime: minutesAgo(148),
      currentPhase: 'COMMIT',
      phases: buildCompletedPhases('COMMIT'),
      durationMinutes: 12,
    },
    {
      id: 3,
      reportName: 'audit-report-003.md',
      hypothesis: 'Dark mode renk kontrastı WCAG AA standardını karşılamıyor',
      result: 'SUCCESS',
      changedFiles: ['src/theme/index.ts', 'src/components/Card.tsx', 'src/components/Button.tsx'],
      testResult: '✅ 15/15 test geçti',
      commitHash: 'c9a1f88',
      kg: 4.0,
      humanTouchPoints: 1,
      startTime: minutesAgo(140),
      endTime: minutesAgo(120),
      currentPhase: 'COMMIT',
      phases: buildCompletedPhases('COMMIT'),
      durationMinutes: 20,
    },
    {
      id: 4,
      reportName: 'audit-report-004.md',
      hypothesis: 'Memory leak — useEffect cleanup eksik, unmount sırasında listener kalıyor',
      result: 'ROLLBACK',
      changedFiles: ['src/hooks/useAudioMeter.ts'],
      testResult: '❌ 3/10 test başarısız — regression tespit edildi',
      commitHash: '',
      kg: 4.0,
      humanTouchPoints: 0,
      startTime: minutesAgo(115),
      endTime: minutesAgo(100),
      currentPhase: 'ROLLBACK',
      phases: buildCompletedPhases('ROLLBACK'),
      durationMinutes: 15,
    },
    {
      id: 5,
      reportName: 'audit-report-005.md',
      hypothesis: 'WebSocket bağlantısı race condition — handshake sırası yanlış',
      result: 'STUCK',
      changedFiles: [],
      testResult: '❌ Testler çalıştırılamadı — build hatası',
      commitHash: '',
      kg: 4.0,
      humanTouchPoints: 2,
      startTime: minutesAgo(95),
      endTime: '',
      currentPhase: 'REPAIR',
      phases: buildPhases('REPAIR', 'failed'),
      durationMinutes: 0,
    },
  ];
}

class ForgeManager {
  private cycles: ForgeCycle[] = [];
  private consecutiveFailures: number = 0;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    const savedState = await StorageService.loadForgeState();
    if (savedState) {
      this.cycles = savedState.cycles;
      this.consecutiveFailures = savedState.consecutiveFailures;
    } else {
      this.cycles = createDemoCycles();
      this.consecutiveFailures = 2; // Demo starting point is STUCK
      await this.saveState();
    }
    this.isInitialized = true;
  }

  async saveState(): Promise<void> {
    await StorageService.saveForgeState(this.getState());
  }

  getCycles(): ForgeCycle[] {
    return [...this.cycles];
  }

  getCurrentCycle(): ForgeCycle | null {
    if (this.cycles.length === 0) return null;
    return this.cycles[this.cycles.length - 1];
  }

  isStuck(): boolean {
    return this.consecutiveFailures >= STUCK_THRESHOLD;
  }

  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }

  async startCycle(reportName: string, hypothesis: string): Promise<ForgeCycle> {
    const lastCycle = this.getCurrentCycle();
    const currentKg = lastCycle ? lastCycle.kg : 0;

    const newCycle: ForgeCycle = {
      id: this.cycles.length + 1,
      reportName,
      hypothesis,
      result: 'IN_PROGRESS',
      changedFiles: [],
      testResult: '',
      commitHash: '',
      kg: currentKg,
      humanTouchPoints: 0,
      startTime: new Date().toISOString(),
      endTime: '',
      currentPhase: 'READ',
      phases: PHASE_ORDER.map((phase) => ({
        phase,
        status: phase === 'READ' ? 'active' : 'pending',
        notes: '',
        timestamp: phase === 'READ' ? new Date().toISOString() : '',
      })),
      durationMinutes: 0,
    };

    this.cycles.push(newCycle);
    await this.saveState();
    return newCycle;
  }

  async advancePhase(notes?: string): Promise<ForgeCycle | null> {
    const cycle = this.getCurrentCycle();
    if (!cycle || cycle.result !== 'IN_PROGRESS') return null;

    const currentIndex = PHASE_ORDER.indexOf(cycle.currentPhase);
    if (currentIndex === -1 || currentIndex >= PHASE_ORDER.length - 1) return cycle;

    const currentPhaseEntry = cycle.phases.find((p) => p.phase === cycle.currentPhase);
    if (currentPhaseEntry) {
      currentPhaseEntry.status = 'done';
      currentPhaseEntry.notes = notes || `${cycle.currentPhase} tamamlandı`;
      currentPhaseEntry.timestamp = new Date().toISOString();
    }

    const nextPhase = PHASE_ORDER[currentIndex + 1];
    cycle.currentPhase = nextPhase;

    const nextPhaseEntry = cycle.phases.find((p) => p.phase === nextPhase);
    if (nextPhaseEntry) {
      nextPhaseEntry.status = 'active';
      nextPhaseEntry.timestamp = new Date().toISOString();
    }

    await this.saveState();
    return cycle;
  }

  async completeCycle(
    result: ForgeResult,
    options?: {
      testResult?: string;
      changedFiles?: string[];
      kgIncrease?: number;
      stuckReason?: string;
    }
  ): Promise<ForgeCycle | null> {
    const cycle = this.getCurrentCycle();
    if (!cycle || cycle.result !== 'IN_PROGRESS') return null;

    cycle.result = result;
    cycle.endTime = new Date().toISOString();

    const startMs = new Date(cycle.startTime).getTime();
    const endMs = new Date(cycle.endTime).getTime();
    cycle.durationMinutes = Math.round((endMs - startMs) / 60000);

    if (options?.testResult) cycle.testResult = options.testResult;
    if (options?.changedFiles) cycle.changedFiles = options.changedFiles;

    if (result === 'SUCCESS') {
      const increase = options?.kgIncrease ?? 1.0;
      cycle.kg = cycle.kg + increase;
      cycle.commitHash = generateCommitHash();
      this.consecutiveFailures = 0;

      cycle.currentPhase = 'COMMIT';
      cycle.phases.push({
        phase: 'COMMIT',
        status: 'done',
        notes: 'Değişiklikler commit edildi',
        timestamp: new Date().toISOString(),
      });
    } else {
      this.consecutiveFailures++;

      if (result === 'ROLLBACK') {
        cycle.currentPhase = 'ROLLBACK';
        cycle.phases.push({
          phase: 'ROLLBACK',
          status: 'done',
          notes: 'Değişiklikler geri alındı',
          timestamp: new Date().toISOString(),
        });
      }

      if (result === 'STUCK') {
        const activePhase = cycle.phases.find((p) => p.status === 'active');
        if (activePhase) {
          activePhase.status = 'failed';
          activePhase.notes = options?.stuckReason || 'İlerleme sağlanamadı';
        }
        cycle.humanTouchPoints++;
      }
    }

    for (const phaseEntry of cycle.phases) {
      if (phaseEntry.status === 'active' && result !== 'IN_PROGRESS') {
        if (result === 'SUCCESS') {
          phaseEntry.status = 'done';
        }
      }
    }

    await this.saveState();
    return cycle;
  }

  getState(): ForgeState {
    return {
      cycles: [...this.cycles],
      consecutiveFailures: this.consecutiveFailures,
      totalKg: this.getCurrentKg(),
      isStuck: this.isStuck(),
      stuckReason: this.isStuck()
        ? `${this.consecutiveFailures} ardışık başarısızlık — uzman müdahalesi gerekli`
        : '',
      totalHumanTouchPoints: this.getTotalHumanTouchPoints(),
    };
  }

  private getCurrentKg(): number {
    if (this.cycles.length === 0) return 0;
    return Math.max(...this.cycles.map((c) => c.kg));
  }

  private getTotalHumanTouchPoints(): number {
    return this.cycles.reduce((sum, c) => sum + c.humanTouchPoints, 0);
  }
}

export const ForgeService = new ForgeManager();
export default ForgeService;
