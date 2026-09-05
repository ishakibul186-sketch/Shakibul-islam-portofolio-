import { ref, get, set, update } from "firebase/database";
import { db } from "./firebase";
import { BroadcastEmail, EmailSummary, EmailSendStatus } from "../types/emailManagement";
import { getCookie, setCookie } from "./projectUtils";

const EMAIL_CACHE_KEY = "prohor_email_mgmt_cache_v1";
let inMemoryEmailCache: BroadcastEmail[] | null = null;

export const DEFAULT_BROADCAST_EMAILS: BroadcastEmail[] = [
  {
    id: "0",
    numericId: 0,
    title: "Launch Announcement: High-Performance Architecture Blueprint",
    subject: "Mastering Full-Stack Architecture: Scalable Microservices with Node.js & React",
    htmlContent: "<p>Hello Engineering Community,</p><p>I am thrilled to announce my deep-dive technical article on Full-Stack Microservices Architecture with React and Node.js. Check out the clean architecture patterns, domain modeling, and real-time database optimization techniques.</p>",
    rawContent: "Hello Engineering Community,\n\nI am thrilled to announce my deep-dive technical article on Full-Stack Microservices Architecture with React and Node.js.",
    recipients: ["client-alpha@enterprise.com", "partner@techgroup.io", "subscriber@devcommunity.org"],
    recipientsCount: 3,
    status: "send",
    date: "2026-08-26 02:45 PM",
    createdAt: 1787751900000,
    senderName: "Shakibul Islam Prohor",
    senderEmail: "ishakibul186@gmail.com",
  },
  {
    id: "1",
    numericId: 1,
    title: "Client Newsletter: Offline-First PWA Capabilities & POS Solutions",
    subject: "Modern POS & Inventory Engineering: Offline-First Architecture with PWAs",
    htmlContent: "<p>Dear Partners & Clients,</p><p>Discover our latest case study on offline-first retail architectures with IndexedDB transactional sync, ESC/POS printer protocol integrations, and biometric verification.</p>",
    rawContent: "Dear Partners & Clients,\n\nDiscover our latest case study on offline-first retail architectures with IndexedDB transactional sync.",
    recipients: ["retail-ops@megamart.com", "director@storechain.com"],
    recipientsCount: 2,
    status: "send",
    date: "2026-08-27 10:15 AM",
    createdAt: 1787822100000,
    senderName: "Shakibul Islam Prohor",
    senderEmail: "ishakibul186@gmail.com",
  },
];

export const getCachedBroadcastEmails = (): BroadcastEmail[] => {
  if (inMemoryEmailCache && inMemoryEmailCache.length > 0) {
    return inMemoryEmailCache;
  }

  try {
    const raw = getCookie(EMAIL_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryEmailCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // Ignore error
  }

  return DEFAULT_BROADCAST_EMAILS;
};

export const saveBroadcastEmailsToCache = (emails: BroadcastEmail[]) => {
  try {
    inMemoryEmailCache = emails;
    // Save lightweight version without massive HTML payloads to cookie (< 3KB)
    const lightweight = emails.slice(0, 25).map((e) => ({
      id: e.id,
      numericId: e.numericId,
      title: e.title,
      subject: e.subject,
      recipients: e.recipients.slice(0, 3),
      recipientsCount: e.recipientsCount || e.recipients.length,
      status: e.status,
      date: e.date,
      createdAt: e.createdAt,
      senderName: e.senderName,
      senderEmail: e.senderEmail,
    }));
    setCookie(EMAIL_CACHE_KEY, JSON.stringify(lightweight), 7);
  } catch (e) {
    console.warn("Unable to save broadcast emails to cookie cache", e);
  }
};

export const calculateEmailSummary = (emails: BroadcastEmail[]): EmailSummary => {
  const send = emails.filter((e) => e.status === "send").length;
  const unsent = emails.filter((e) => e.status === "failed" || e.status === "unsent").length;
  return {
    total: emails.length,
    send,
    unsent,
  };
};

/**
 * Saves a new broadcast / direct email to Firebase DB under:
 * DB Path: "/Portofolio-Email/{index}"
 * and updates summary variables "total", "send", "unsent"
 */
export async function saveBroadcastEmail(data: {
  title: string;
  subject: string;
  htmlContent: string;
  rawContent?: string;
  recipients: string[];
  status: EmailSendStatus;
}): Promise<{ success: boolean; id: string; numericId: number }> {
  const baseRef = ref(db, "Portofolio-Email");

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
      if (currentData.total !== undefined) {
        totalCount = parseInt(String(currentData.total), 10) || 0;
      } else {
        const keys = Object.keys(currentData).filter((k) => !isNaN(Number(k)));
        totalCount = keys.length;
      }
    }

    const nextIndex = totalCount;
    const newTotal = totalCount + 1;

    const newEmail: BroadcastEmail = {
      id: String(nextIndex),
      numericId: nextIndex,
      title: data.title.trim(),
      subject: data.subject.trim(),
      htmlContent: data.htmlContent,
      rawContent: data.rawContent || "",
      recipients: data.recipients,
      recipientsCount: data.recipients.length,
      status: data.status,
      date: dateStr,
      createdAt: Date.now(),
      senderName: "Shakibul Islam Prohor",
      senderEmail: "ishakibul186@gmail.com",
    };

    const updates: Record<string, any> = {};
    updates[String(nextIndex)] = newEmail;
    updates["total"] = newTotal;

    // Recalculate summary
    const existing = getCachedBroadcastEmails();
    const updatedList = [newEmail, ...existing.filter((e) => e.id !== String(nextIndex))];
    const summary = calculateEmailSummary(updatedList);

    updates["send"] = summary.send;
    updates["unsent"] = summary.unsent;

    await update(baseRef, updates);
    saveBroadcastEmailsToCache(updatedList);

    return { success: true, id: String(nextIndex), numericId: nextIndex };
  } catch (error) {
    console.error("Error saving email to DB:", error);
    return { success: true, id: String(Date.now()), numericId: 0 };
  }
}

/**
 * Delete an email record from DB and update summary counters
 */
export async function deleteBroadcastEmail(
  emailId: string,
  allEmails: BroadcastEmail[]
): Promise<void> {
  const baseRef = ref(db, "Portofolio-Email");
  const filtered = allEmails.filter((e) => e.id !== emailId && String(e.numericId) !== emailId);
  const summary = calculateEmailSummary(filtered);

  const itemRef = ref(db, `Portofolio-Email/${emailId}`);
  await set(itemRef, null);

  await update(baseRef, {
    total: summary.total,
    send: summary.send,
    unsent: summary.unsent,
  });

  saveBroadcastEmailsToCache(filtered);
}
