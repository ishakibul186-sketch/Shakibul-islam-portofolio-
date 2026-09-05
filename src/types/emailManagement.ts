export type EmailSendStatus = "send" | "failed" | "unsent";

export interface BroadcastEmail {
  id: string;
  numericId: number;
  title: string;
  subject: string;
  htmlContent: string;
  rawContent?: string;
  recipients: string[];
  recipientsCount: number;
  status: EmailSendStatus;
  date: string;
  createdAt: number;
  senderName?: string;
  senderEmail?: string;
}

export interface EmailSummary {
  total: number;
  send: number;
  unsent: number;
}
