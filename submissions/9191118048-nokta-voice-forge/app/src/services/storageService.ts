/**
 * Nokta Voice Forge — Storage Service
 * AsyncStorage wrapper for persisting app state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ForgeState, AuditReport, ExpertCall, PersonaId } from '../types';

const KEY_PREFIX = '@nokta_voice_forge:';

const KEYS = {
  FORGE_STATE: `${KEY_PREFIX}forge_state`,
  AUDIT_REPORTS: `${KEY_PREFIX}audit_reports`,
  EXPERT_CALLS: `${KEY_PREFIX}expert_calls`,
  PERSONA: `${KEY_PREFIX}persona`,
} as const;

export const StorageService = {
  // ─── Forge State ─────────────────────────────────────────

  async saveForgeState(state: ForgeState): Promise<void> {
    try {
      const json = JSON.stringify(state);
      await AsyncStorage.setItem(KEYS.FORGE_STATE, json);
    } catch (error) {
      console.error('[StorageService] Failed to save forge state:', error);
    }
  },

  async loadForgeState(): Promise<ForgeState | null> {
    try {
      const json = await AsyncStorage.getItem(KEYS.FORGE_STATE);
      if (!json) return null;
      return JSON.parse(json) as ForgeState;
    } catch (error) {
      console.error('[StorageService] Failed to load forge state:', error);
      return null;
    }
  },

  // ─── Audit Reports ──────────────────────────────────────

  async saveAuditReports(reports: AuditReport[]): Promise<void> {
    try {
      const json = JSON.stringify(reports);
      await AsyncStorage.setItem(KEYS.AUDIT_REPORTS, json);
    } catch (error) {
      console.error('[StorageService] Failed to save audit reports:', error);
    }
  },

  async loadAuditReports(): Promise<AuditReport[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.AUDIT_REPORTS);
      if (!json) return [];
      return JSON.parse(json) as AuditReport[];
    } catch (error) {
      console.error('[StorageService] Failed to load audit reports:', error);
      return [];
    }
  },

  // ─── Expert Calls ───────────────────────────────────────

  async saveExpertCalls(calls: ExpertCall[]): Promise<void> {
    try {
      const json = JSON.stringify(calls);
      await AsyncStorage.setItem(KEYS.EXPERT_CALLS, json);
    } catch (error) {
      console.error('[StorageService] Failed to save expert calls:', error);
    }
  },

  async loadExpertCalls(): Promise<ExpertCall[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.EXPERT_CALLS);
      if (!json) return [];
      return JSON.parse(json) as ExpertCall[];
    } catch (error) {
      console.error('[StorageService] Failed to load expert calls:', error);
      return [];
    }
  },

  // ─── Persona Preference ─────────────────────────────────

  async savePersona(persona: PersonaId): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PERSONA, persona);
    } catch (error) {
      console.error('[StorageService] Failed to save persona:', error);
    }
  },

  async loadPersona(): Promise<PersonaId | null> {
    try {
      const value = await AsyncStorage.getItem(KEYS.PERSONA);
      if (!value) return null;
      if (value === 'junior' || value === 'senior') {
        return value as PersonaId;
      }
      return null;
    } catch (error) {
      console.error('[StorageService] Failed to load persona:', error);
      return null;
    }
  },

  // ─── Clear All ──────────────────────────────────────────

  async clearAll(): Promise<void> {
    try {
      const allKeys = Object.values(KEYS);
      await AsyncStorage.multiRemove(allKeys);
    } catch (error) {
      console.error('[StorageService] Failed to clear storage:', error);
    }
  },
};

export default StorageService;
