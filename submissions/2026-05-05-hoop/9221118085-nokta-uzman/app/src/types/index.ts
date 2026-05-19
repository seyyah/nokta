export type Message = {
    id: string;
    role: "user" | "ai" | "expert";
    text: string;
};

export type ExpertRequest = {
    id: string;
    idea: string;
    aiSummary: string;
    riskLevel: "Low" | "Medium" | "High";
    status: "Pending" | "Reviewed";
    expertVerdict?: string;
};