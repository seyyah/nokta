export type MascotState = 'idle' | 'sleep' | 'talking' | 'love' | 'angry';

export interface NoktaArtifact {
    id: string;
    title: string;
    dot: string;
    spec: string;
    confidenceScore: number;
    timestamp: number;
    riskMode: 'HITL' | 'HOTL' | 'HOOTL';
    expertCategory?: ExpertCategory;
    escalationStatus: 'pending' | 'escalated' | 'resolved';
}

export type ExpertCategory = 'Hukuk' | 'Sağlık' | 'Finans' | 'Teknik' | 'Eğitim';

export type EscalationChannel = 'Mesaj' | 'Video Görüşme';

export interface EscalationRecord {
    id: string;
    artifactId: string;
    category: ExpertCategory;
    channel: EscalationChannel;
    timestamp: number;
    status: 'active' | 'completed';
}
