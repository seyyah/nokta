import AsyncStorage from '@react-native-async-storage/async-storage';
import { EscalationRecord, NoktaArtifact } from '../types';

const STORAGE_KEYS = {
    RECORDS: '@nokta_escalations',
    ARTIFACTS: '@nokta_artifacts',
};

class EscalationService {
    async saveArtifact(artifact: NoktaArtifact) {
        const existing = await this.getArtifacts();
        const updated = [artifact, ...existing];
        await AsyncStorage.setItem(STORAGE_KEYS.ARTIFACTS, JSON.stringify(updated));
    }

    async getArtifacts(): Promise<NoktaArtifact[]> {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.ARTIFACTS);
        return data ? JSON.parse(data) : [];
    }

    async createEscalation(record: EscalationRecord) {
        const existing = await this.getRecords();
        const updated = [record, ...existing];
        await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
    }

    async getRecords(): Promise<EscalationRecord[]> {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.RECORDS);
        return data ? JSON.parse(data) : [];
    }
}

export default new EscalationService();
