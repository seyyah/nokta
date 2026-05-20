import { create } from 'zustand';

export interface Message {
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
}

export interface Idea {
    id: string;
    title: string;
    spark: string;
    status: 'dot' | 'line' | 'paragraph' | 'page';
    createdAt: Date;
    messages: Message[];
}

interface AppStore {
    ideas: Idea[];
    addIdea: (idea: Idea) => void;
    addMessage: (ideaId: string, message: Message) => void;
    updateIdea: (ideaId: string, updates: Partial<Idea>) => void;
}

export const useAppStore = create<AppStore>((set) => ({
    ideas: [
        {
            id: '1',
            title: 'Real-time Collaboration Widget',
            spark: 'Enable multiple users to brainstorm ideas simultaneously in the app',
            status: 'dot',
            createdAt: new Date('2026-01-15'),
            messages: [
                {
                    role: 'agent',
                    content: 'What problem does this solve for your users?',
                    timestamp: new Date('2026-01-15'),
                },
                {
                    role: 'user',
                    content: 'Teams often work in silos. Real-time collaboration helps them align.',
                    timestamp: new Date('2026-01-15'),
                },
            ],
        },
        {
            id: '2',
            title: 'AI-Powered Feature Suggestions',
            spark: 'Suggest relevant features based on user behavior patterns',
            status: 'line',
            createdAt: new Date('2026-01-20'),
            messages: [
                {
                    role: 'agent',
                    content: 'How would you measure success?',
                    timestamp: new Date('2026-01-20'),
                },
                {
                    role: 'user',
                    content: 'By user adoption rate of suggested features (target: 35%)',
                    timestamp: new Date('2026-01-20'),
                },
            ],
        },
        {
            id: '3',
            title: 'Dark Mode Support',
            spark: 'Implement dark mode for reduced eye strain in low-light environments',
            status: 'paragraph',
            createdAt: new Date('2026-02-01'),
            messages: [],
        },
    ],
    addIdea: (idea: Idea) =>
        set((state) => ({
            ideas: [...state.ideas, idea],
        })),
    addMessage: (ideaId: string, message: Message) =>
        set((state) => ({
            ideas: state.ideas.map((idea) =>
                idea.id === ideaId ? { ...idea, messages: [...idea.messages, message] } : idea
            ),
        })),
    updateIdea: (ideaId: string, updates: Partial<Idea>) =>
        set((state) => ({
            ideas: state.ideas.map((idea) => (idea.id === ideaId ? { ...idea, ...updates } : idea)),
        })),
}));
