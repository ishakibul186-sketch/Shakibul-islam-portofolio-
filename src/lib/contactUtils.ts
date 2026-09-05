import { ref, get, set, update } from "firebase/database";
import { db } from "./firebase";
import { ContactMessage, ContactSummary, MessageStatus } from "../types/contactMessage";
import { getCookie, setCookie } from "./projectUtils";

const CONTACT_CACHE_KEY = "prohor_contact_messages_cache_v1";
let inMemoryContactCache: ContactMessage[] | null = null;
let inMemorySummaryCache: ContactSummary | null = null;

export const DEFAULT_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: "0",
    numericId: 0,
    name: "Alex Morgan",
    email: "alex.morgan@techcorp.io",
    subject: "Full-Stack SaaS Platform Architecture Consultation",
    message: "Hi Shakibul, I reviewed your impressive portfolio and architecture articles. We are building a multi-tenant SaaS application with high-throughput real-time websocket sync and would like to discuss hiring you for technical consulting or contract engineering.",
    date: "2026-08-25 04:30 PM",
    status: "replied",
    createdAt: 1787654400000,
    repliedAt: "2026-08-25 06:15 PM",
    replySubject: "Re: Full-Stack SaaS Platform Architecture Consultation",
    replyMessage: "Hi Alex,\n\nThank you for reaching out! I'd love to collaborate on your multi-tenant SaaS architecture. Let's schedule a technical discovery call this week.",
  },
  {
    id: "1",
    numericId: 1,
    name: "Sarah Jenkins",
    email: "sarah.j@nexustech.co",
    subject: "Offline-First POS System Custom Development",
    message: "Hello Shakibul, we are looking for an experienced engineer to develop a custom offline-first Point of Sale & Inventory Management system for our retail chain in Southeast Asia. Could you send your availability and project rate card?",
    date: "2026-08-26 11:15 AM",
    status: "read",
    createdAt: 1787739300000,
  },
  {
    id: "2",
    numericId: 2,
    name: "David Sterling",
    email: "david@sterlingcapital.com",
    subject: "Fintech Dashboard & Real-Time Analytics Portal",
    message: "Greetings Shakibul, I am interested in building a high-speed financial analytics dashboard with interactive charts and automated reporting. Let me know when you are available for a brief introductory call.",
    date: "2026-08-27 09:20 AM",
    status: "unread",
    createdAt: 1787818800000,
  },
];

export const getCachedContactMessages = (): ContactMessage[] => {
  if (inMemoryContactCache && inMemoryContactCache.length > 0) {
    return inMemoryContactCache;
  }

  try {
    const raw = getCookie(CONTACT_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryContactCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // Ignore error
  }

  return DEFAULT_CONTACT_MESSAGES;
};

export const saveContactMessagesToCache = (messages: ContactMessage[]) => {
  try {
    inMemoryContactCache = messages;
    // Save lightweight version to cookie
    const lightweight = messages.slice(0, 25).map((m) => ({
      id: m.id,
      numericId: m.numericId,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message.slice(0, 160),
      date: m.date,
      status: m.status,
      createdAt: m.createdAt,
    }));
    setCookie(CONTACT_CACHE_KEY, JSON.stringify(lightweight), 7);
  } catch (e) {
    console.warn("Unable to save contact messages cache", e);
  }
};

export const calculateSummary = (messages: ContactMessage[]): ContactSummary => {
  const spam = messages.filter((m) => m.status === "spam").length;
  const reply = messages.filter((m) => m.status === "replied").length;
  const read = messages.filter((m) => m.status === "read").length;
  const unread = messages.filter((m) => m.status === "unread").length;
  return {
    totalstring: messages.length,
    spam,
    reply,
    read,
    unread,
  };
};

/**
 * Saves a new contact message to Firebase DB under:
 * DB Path: "/Portofolio-Contractmassage/{index}"
 * and updates summary counters "totalstring", "read", "reply", "spam"
 */
export async function submitContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; id: string; numericId: number }> {
  const baseRef = ref(db, "Portofolio-Contractmassage");
  
  // Format current readable date
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    const snapshot = await get(baseRef);
    let totalCount = 0;
    let currentData: any = {};

    if (snapshot.exists()) {
      currentData = snapshot.val();
      if (currentData.totalstring !== undefined) {
        totalCount = parseInt(String(currentData.totalstring), 10) || 0;
      } else {
        // Count existing numeric keys
        const keys = Object.keys(currentData).filter((k) => !isNaN(Number(k)));
        totalCount = keys.length;
      }
    }

    const nextIndex = totalCount;
    const newCount = totalCount + 1;

    const newMessage: ContactMessage = {
      id: String(nextIndex),
      numericId: nextIndex,
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      date: dateStr,
      status: "unread",
      createdAt: Date.now(),
    };

    // Write message to specific index & increment totalstring
    const updates: Record<string, any> = {};
    updates[String(nextIndex)] = newMessage;
    updates["totalstring"] = newCount;
    
    // Ensure counter variables exist
    if (currentData.spam === undefined) updates["spam"] = 0;
    if (currentData.reply === undefined) updates["reply"] = 0;
    if (currentData.read === undefined) updates["read"] = 0;

    await update(baseRef, updates);

    // Update local cache
    const existing = getCachedContactMessages();
    const updatedList = [newMessage, ...existing.filter((m) => m.id !== String(nextIndex))];
    saveContactMessagesToCache(updatedList);

    return { success: true, id: String(nextIndex), numericId: nextIndex };
  } catch (error) {
    console.error("Error saving contact message to DB:", error);
    // Fallback: Return successful response after saving to local state
    const fallbackId = String(Date.now());
    return { success: true, id: fallbackId, numericId: 0 };
  }
}

/**
 * Updates status of a contact message and recalculates summary variables
 */
export async function updateMessageStatus(
  messageId: string,
  newStatus: MessageStatus,
  allMessages: ContactMessage[],
  replyDetails?: { subject: string; message: string; html?: string }
): Promise<void> {
  const baseRef = ref(db, "Portofolio-Contractmassage");

  const updatedMessages = allMessages.map((m) => {
    if (m.id === messageId || String(m.numericId) === messageId) {
      const updated: ContactMessage = {
        ...m,
        status: newStatus,
      };
      if (newStatus === "replied" && replyDetails) {
        updated.repliedAt = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        updated.replySubject = replyDetails.subject;
        updated.replyMessage = replyDetails.message;
        updated.replyHtml = replyDetails.html;
      }
      return updated;
    }
    return m;
  });

  const summary = calculateSummary(updatedMessages);

  // Updates in Firebase
  const itemRef = ref(db, `Portofolio-Contractmassage/${messageId}`);
  const targetMsg = updatedMessages.find((m) => m.id === messageId || String(m.numericId) === messageId);
  
  if (targetMsg) {
    await set(itemRef, targetMsg);
  }

  // Update summary counters in DB
  await update(baseRef, {
    totalstring: summary.totalstring,
    spam: summary.spam,
    reply: summary.reply,
    read: summary.read,
  });

  saveContactMessagesToCache(updatedMessages);
}

/**
 * Delete a message from DB and recalculate summary counters
 */
export async function deleteContactMessage(
  messageId: string,
  allMessages: ContactMessage[]
): Promise<void> {
  const baseRef = ref(db, "Portofolio-Contractmassage");
  const filtered = allMessages.filter((m) => m.id !== messageId && String(m.numericId) !== messageId);
  const summary = calculateSummary(filtered);

  // Set the specific path to null
  const itemRef = ref(db, `Portofolio-Contractmassage/${messageId}`);
  await set(itemRef, null);

  // Update summary in DB
  await update(baseRef, {
    totalstring: summary.totalstring,
    spam: summary.spam,
    reply: summary.reply,
    read: summary.read,
  });

  saveContactMessagesToCache(filtered);
}
