export type MessageStatus = "unread" | "read" | "replied" | "spam";

export interface ContactMessage {
  id: string;
  numericId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: MessageStatus;
  createdAt: number;
  repliedAt?: string;
  replySubject?: string;
  replyMessage?: string;
  replyHtml?: string;
}

export interface ContactSummary {
  totalstring: number;
  spam: number;
  reply: number;
  read: number;
  unread: number;
}
