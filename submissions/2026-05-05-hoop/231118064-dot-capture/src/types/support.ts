export type SupportType = 
  | "mentor_review" 
  | "technical_review" 
  | "product_review" 
  | "ethical_review" 
  | "final_approval";

export type SupportPriority = "low" | "medium" | "high";

export type SupportStatus = "pending" | "in_review" | "resolved" | "rejected";

export type HumanSupportRequest = {
  id: string;
  ideaId?: string;
  specId?: string;
  title: string;
  description: string;
  supportType: SupportType;
  priority: SupportPriority;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  humanFeedback?: string;
  transcriptSummary?: string;
  decisionLog?: string;
};

export type MascotState = "idle" | "thinking" | "speaking" | "happy" | "error";
