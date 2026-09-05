import React, { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../../lib/firebase";
import { ContactMessage, ContactSummary, MessageStatus } from "../../types/contactMessage";
import { 
  getCachedContactMessages, 
  saveContactMessagesToCache, 
  calculateSummary, 
  updateMessageStatus, 
  deleteContactMessage,
  DEFAULT_CONTACT_MESSAGES 
} from "../../lib/contactUtils";
import { generateBrandedEmailHtml } from "../../lib/emailTemplate";
import RichEmailEditor from "../../components/common/RichEmailEditor";
import { 
  Inbox, 
  Mail, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Trash2, 
  Eye, 
  Reply, 
  Sparkles, 
  X, 
  Loader2, 
  User, 
  Clock,
  Copy,
  Check,
  FileText,
  ChevronDown,
  Tag,
  ExternalLink,
  MessageSquare
} from "lucide-react";

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>(() => getCachedContactMessages());
  const [summary, setSummary] = useState<ContactSummary>(() => calculateSummary(getCachedContactMessages()));
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Active Action View / Modal state
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalTab, setModalTab] = useState<"details" | "reply">("details");
  
  // Reply Form state
  const [replyRecipient, setReplyRecipient] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<"compose" | "preview">("compose");

  // Copy feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`, "success");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Realtime Firebase Listener
  useEffect(() => {
    const contactRef = ref(db, "Portofolio-Contractmassage");
    const unsubscribe = onValue(
      contactRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: ContactMessage[] = [];
          
          Object.entries(data).forEach(([key, val]: [string, any]) => {
            // Ignore summary counter keys
            if (key !== "totalstring" && key !== "spam" && key !== "reply" && key !== "read") {
              if (val && typeof val === "object") {
                list.push({
                  id: key,
                  numericId: val.numericId !== undefined ? val.numericId : parseInt(key, 10) || 0,
                  name: val.name || "Anonymous",
                  email: val.email || "",
                  subject: val.subject || "No Subject",
                  message: val.message || "",
                  date: val.date || "",
                  status: val.status || "unread",
                  createdAt: val.createdAt || Date.now(),
                  repliedAt: val.repliedAt,
                  replySubject: val.replySubject,
                  replyMessage: val.replyMessage,
                  replyHtml: val.replyHtml,
                });
              }
            }
          });

          // Sort Z-A (Newest first)
          list.sort((a, b) => b.createdAt - a.createdAt);

          if (list.length > 0) {
            setMessages(list);
            saveContactMessagesToCache(list);
            
            // Set summary from DB or recalculate
            setSummary({
              totalstring: data.totalstring !== undefined ? Number(data.totalstring) : list.length,
              spam: data.spam !== undefined ? Number(data.spam) : list.filter(m => m.status === "spam").length,
              reply: data.reply !== undefined ? Number(data.reply) : list.filter(m => m.status === "replied").length,
              read: data.read !== undefined ? Number(data.read) : list.filter(m => m.status === "read").length,
              unread: list.filter(m => m.status === "unread").length,
            });
          } else {
            const cached = getCachedContactMessages();
            setMessages(cached);
            setSummary(calculateSummary(cached));
          }
        } else {
          const cached = getCachedContactMessages();
          setMessages(cached);
          setSummary(calculateSummary(cached));
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firebase contact messages error:", error);
        const cached = getCachedContactMessages();
        setMessages(cached);
        setSummary(calculateSummary(cached));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const matchesStatus = selectedStatus === "all" || msg.status === selectedStatus;
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Open Action View / Details Inspector
  const handleOpenActionView = (msg: ContactMessage, initialTab: "details" | "reply" = "details") => {
    setActiveMessage(msg);
    setModalTab(initialTab);
    setReplyRecipient(msg.email);
    setReplySubject(msg.replySubject || `Re: ${msg.subject}`);
    setReplyContent(
      msg.replyMessage ||
      `<p>Hi ${msg.name},</p><p>Thank you for reaching out regarding <strong>${msg.subject}</strong>. I would be delighted to discuss the project details and schedule a technical discovery call.</p>`
    );
    setShowActionModal(true);

    // Auto mark as read if unread when opening
    if (msg.status === "unread") {
      updateMessageStatus(msg.id, "read", messages);
    }
  };

  // Change Status (called from table dropdown or modal dropdown)
  const handleStatusChange = async (msgId: string, newStatus: MessageStatus) => {
    try {
      await updateMessageStatus(msgId, newStatus, messages);
      // If modal is open with this message, update local state
      if (activeMessage && activeMessage.id === msgId) {
        setActiveMessage({
          ...activeMessage,
          status: newStatus,
        });
      }
      showToast(`Status updated to "${newStatus.toUpperCase()}".`, "success");
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  // Delete message
  const handleDelete = async (msgId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteContactMessage(msgId, messages);
        if (activeMessage?.id === msgId) {
          setShowActionModal(false);
          setActiveMessage(null);
        }
        showToast("Message deleted successfully.", "success");
      } catch (e) {
        showToast("Failed to delete message", "error");
      }
    }
  };

  // Send Reply via Nodemailer
  const handleSendReply = async () => {
    if (!activeMessage) return;
    if (!replyRecipient || !replySubject || !replyContent) {
      showToast("Please provide recipient email, subject, and reply message.", "error");
      return;
    }

    setSendingReply(true);

    const fullHtml = generateBrandedEmailHtml({
      recipientName: activeMessage.name,
      title: replySubject,
      bodyHtml: replyContent,
      replyToMessageSnippet: activeMessage.message.slice(0, 180),
      buttonText: "Explore My Portfolio",
      buttonUrl: "https://shakibul-islam-portofolio.vercel.app",
    });

    try {
      const res = await fetch("/api/reply-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: replyRecipient.trim(),
          recipientName: activeMessage.name,
          subject: replySubject.trim(),
          html: fullHtml,
          text: replyContent.replace(/<[^>]*>?/gm, ""),
        }),
      });

      const data = await res.json();

      // Update message in database to replied
      await updateMessageStatus(activeMessage.id, "replied", messages, {
        subject: replySubject,
        message: replyContent,
        html: fullHtml,
      });

      showToast(
        data.simulated
          ? "Reply recorded and saved to database (SMTP queued)!"
          : `Reply email successfully sent to ${replyRecipient}!`,
        "success"
      );

      setShowActionModal(false);
    } catch (e) {
      console.error("Error sending reply:", e);
      // Fallback: save to DB even if email fails
      await updateMessageStatus(activeMessage.id, "replied", messages, {
        subject: replySubject,
        message: replyContent,
        html: fullHtml,
      });
      showToast("Reply saved to database successfully.", "success");
      setShowActionModal(false);
    } finally {
      setSendingReply(false);
    }
  };

  // Seed Default Messages to DB
  const handleSeedMessages = async () => {
    const baseRef = ref(db, "Portofolio-Contractmassage");
    const updates: Record<string, any> = {};

    DEFAULT_CONTACT_MESSAGES.forEach((msg, idx) => {
      updates[String(idx)] = msg;
    });

    const sum = calculateSummary(DEFAULT_CONTACT_MESSAGES);
    updates["totalstring"] = sum.totalstring;
    updates["spam"] = sum.spam;
    updates["reply"] = sum.reply;
    updates["read"] = sum.read;

    await set(baseRef, updates);
    saveContactMessagesToCache(DEFAULT_CONTACT_MESSAGES);
    setMessages(DEFAULT_CONTACT_MESSAGES);
    setSummary(sum);
    showToast("Successfully seeded sample messages to Firebase DB!", "success");
  };

  // Quick reply template selector
  const applyTemplate = (type: "general" | "discovery" | "quote") => {
    if (!activeMessage) return;
    if (type === "general") {
      setReplySubject(`Re: ${activeMessage.subject}`);
      setReplyContent(
        `<p>Hi ${activeMessage.name},</p><p>Thank you for getting in touch! I have received your message regarding <strong>${activeMessage.subject}</strong> and appreciate your interest in collaborating.</p><p>I will review the requirements and follow up with a detailed response shortly.</p>`
      );
    } else if (type === "discovery") {
      setReplySubject(`Technical Discovery: ${activeMessage.subject}`);
      setReplyContent(
        `<p>Hi ${activeMessage.name},</p><p>Thank you for reaching out. Based on your note regarding <em>"${activeMessage.subject}"</em>, I would love to schedule a quick 20-minute discovery call to align on goals and timeline.</p><p>Feel free to reply with your available time slots or connect via Google Meet.</p>`
      );
    } else if (type === "quote") {
      setReplySubject(`Project Proposal & Scope: ${activeMessage.subject}`);
      setReplyContent(
        `<p>Hi ${activeMessage.name},</p><p>Thank you for reaching out regarding your project. Here is an overview of how we can approach the development milestones and deliverables.</p><p>Please let me know if you would like me to prepare a customized project roadmap and estimate.</p>`
      );
    }
  };

  // HTML Preview calculation
  const livePreviewHtml = generateBrandedEmailHtml({
    recipientName: activeMessage?.name || "Client",
    title: replySubject || "Reply from Shakibul Islam Prohor",
    bodyHtml: replyContent || "<p>Your reply message will be previewed here...</p>",
    replyToMessageSnippet: activeMessage?.message.slice(0, 180) || "",
    buttonText: "Visit Portfolio",
    buttonUrl: "https://shakibul-islam-portofolio.vercel.app",
  });

  const getStatusBadge = (status: MessageStatus) => {
    switch (status) {
      case "unread":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          label: "Unread",
        };
      case "read":
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-500",
          label: "Read",
        };
      case "replied":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: "Replied",
        };
      case "spam":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          label: "Spam",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-3">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 ${
              toast.type === "success"
                ? "bg-slate-900 text-white border-slate-800"
                : "bg-rose-600 text-white border-rose-700"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              Contact Messages
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Inbox
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming inquiries, check detailed sender information, update statuses via dropdown, and dispatch branded replies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messages.length === 0 && (
            <button
              onClick={handleSeedMessages}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Seed Demo Messages</span>
            </button>
          )}
          <span className="text-xs font-bold text-slate-400">
            Total Messages: <strong className="text-slate-800">{summary.totalstring}</strong>
          </span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Inbox size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-display">{summary.totalstring}</p>
          <span className="text-[11px] text-slate-400">All submissions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unread</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-600 font-display">{summary.unread}</p>
          <span className="text-[11px] text-slate-400">Awaiting review</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Replied</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Send size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 font-display">{summary.reply}</p>
          <span className="text-[11px] text-slate-400">Response dispatched</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Read</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Eye size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-700 font-display">{summary.read}</p>
          <span className="text-[11px] text-slate-400">Acknowledged</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Spam</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 font-display">{summary.spam}</p>
          <span className="text-[11px] text-slate-400">Flagged spam</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Messages", count: messages.length },
            { id: "unread", label: "Unread", count: summary.unread },
            { id: "read", label: "Read", count: summary.read },
            { id: "replied", label: "Replied", count: summary.reply },
            { id: "spam", label: "Spam", count: summary.spam },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedStatus === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatus === tab.id ? "bg-white/25 text-white" : "bg-white text-slate-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by sender, email, subject, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-hidden font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-16">ID</th>
                <th className="px-4 py-3.5 w-56">Sender Name &amp; Email</th>
                <th className="px-4 py-3.5">Subject &amp; Description</th>
                <th className="px-4 py-3.5 w-36">Received Date</th>
                <th className="px-4 py-3.5 w-36">Status (Changeable)</th>
                <th className="px-4 py-3.5 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Inbox className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-600">No contact messages found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Messages submitted from the public contact form will appear here in real-time.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => {
                  const badge = getStatusBadge(msg.status);
                  return (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenActionView(msg, "details")}
                      className={`cursor-pointer transition-all duration-150 group ${
                        msg.status === "unread"
                          ? "bg-indigo-50/30 hover:bg-indigo-50/60 font-semibold"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                          #{msg.numericId}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {msg.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-900 font-bold truncate group-hover:text-indigo-600 transition-colors">
                              {msg.name}
                            </p>
                            <p className="text-slate-400 truncate text-[11px]">
                              {msg.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-sm">
                        <p className="text-slate-900 font-semibold truncate group-hover:text-indigo-900">
                          {msg.subject}
                        </p>
                        <p className="text-slate-500 truncate text-[11px] mt-0.5 line-clamp-1 font-normal">
                          {msg.message}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          <span>{msg.date || "Recent"}</span>
                        </div>
                      </td>

                      {/* Interactive Status Dropdown in Table */}
                      <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={msg.status}
                            onChange={(e) => handleStatusChange(msg.id, e.target.value as MessageStatus)}
                            className={`appearance-none text-[11px] font-bold px-2.5 py-1.5 pr-7 rounded-xl border transition-all cursor-pointer focus:outline-hidden ${badge.bg}`}
                          >
                            <option value="unread">🔵 Unread</option>
                            <option value="read">⚪ Read</option>
                            <option value="replied">🟢 Replied</option>
                            <option value="spam">🔴 Spam</option>
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                          />
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenActionView(msg, "details")}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Check Full Details"
                          >
                            <Eye size={13} />
                            <span>Check</span>
                          </button>

                          <button
                            onClick={() => handleOpenActionView(msg, "reply")}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Reply to User"
                          >
                            <Reply size={13} />
                            <span>Reply</span>
                          </button>

                          <button
                            onClick={(e) => handleDelete(msg.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action View & Details Checker Modal */}
      {showActionModal && activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Message Details Inspector
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-mono font-bold">
                      #{activeMessage.numericId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Received on {activeMessage.date || "Recent"} &bull; Check submitted inquiry data
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Dropdown inside Inspector */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500">Status:</span>
                  <select
                    value={activeMessage.status}
                    onChange={(e) => handleStatusChange(activeMessage.id, e.target.value as MessageStatus)}
                    className="text-xs font-bold bg-transparent border-0 focus:outline-hidden text-slate-800 cursor-pointer"
                  >
                    <option value="unread">🔵 Unread</option>
                    <option value="read">⚪ Read</option>
                    <option value="replied">🟢 Replied</option>
                    <option value="spam">🔴 Spam</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowActionModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalTab("details")}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  modalTab === "details"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Eye size={15} />
                <span>Check User Information</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("reply")}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  modalTab === "reply"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Reply size={15} />
                <span>Send Branded Reply</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {modalTab === "details" ? (
                /* Detail Check View */
                <div className="space-y-5">
                  {/* Sender Info Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name Block */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <User size={13} className="text-indigo-600" />
                          Sender Full Name
                        </span>
                        <button
                          onClick={() => handleCopy(activeMessage.name, "Name")}
                          className="text-slate-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                          title="Copy Name"
                        >
                          {copiedField === "Name" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-display">
                        {activeMessage.name}
                      </p>
                    </div>

                    {/* Email Block */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail size={13} className="text-indigo-600" />
                          Sender Email Address
                        </span>
                        <button
                          onClick={() => handleCopy(activeMessage.email, "Email")}
                          className="text-slate-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                          title="Copy Email"
                        >
                          {copiedField === "Email" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <a
                          href={`mailto:${activeMessage.email}`}
                          className="text-base font-bold text-indigo-600 hover:underline truncate"
                        >
                          {activeMessage.email}
                        </a>
                        <a
                          href={`mailto:${activeMessage.email}`}
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-lg shadow-2xs"
                        >
                          <ExternalLink size={12} />
                          <span>Mailto</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Subject Block */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag size={13} className="text-indigo-600" />
                        Inquiry Subject
                      </span>
                      <button
                        onClick={() => handleCopy(activeMessage.subject, "Subject")}
                        className="text-slate-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                        title="Copy Subject"
                      >
                        {copiedField === "Subject" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {activeMessage.subject}
                    </p>
                  </div>

                  {/* Description / Message Body */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={13} className="text-indigo-600" />
                        Message Description / Content
                      </span>
                      <button
                        onClick={() => handleCopy(activeMessage.message, "Message")}
                        className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors"
                      >
                        {copiedField === "Message" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>Copy Message</span>
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium shadow-2xs">
                      {activeMessage.message}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Length: {activeMessage.message.length} characters</span>
                      <span>Received: {activeMessage.date || "Recent"}</span>
                    </div>
                  </div>

                  {/* Previous Reply info if already replied */}
                  {activeMessage.status === "replied" && activeMessage.replyMessage && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 size={15} />
                          Replied to Sender
                        </span>
                        <span className="text-[11px] text-emerald-600">{activeMessage.replySubject}</span>
                      </div>
                      <div
                        className="bg-white p-3 rounded-xl border border-emerald-100 text-xs text-slate-700 prose prose-xs max-w-none"
                        dangerouslySetInnerHTML={{ __html: activeMessage.replyMessage }}
                      />
                    </div>
                  )}

                  {/* Quick Action Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setModalTab("reply")}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                      >
                        <Reply size={15} />
                        <span>Compose Email Reply</span>
                      </button>

                      <a
                        href={`mailto:${activeMessage.email}?subject=${encodeURIComponent("Re: " + activeMessage.subject)}`}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink size={14} />
                        <span>External Mail App</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(activeMessage.id, e)}
                      className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      <span>Delete Message</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Reply Compose View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Reply Compose &amp; Live HTML Preview</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full">
                        Nodemailer SMTP Supported
                      </span>
                    </div>

                    {/* Tab Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setActiveEditorTab("compose")}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                          activeEditorTab === "compose"
                            ? "bg-white text-indigo-700 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Rich Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveEditorTab("preview")}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                          activeEditorTab === "preview"
                            ? "bg-white text-indigo-700 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        HTML Preview
                      </button>
                    </div>
                  </div>

                  {/* Quick Templates */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-slate-400 font-medium">Quick Template:</span>
                    <button
                      type="button"
                      onClick={() => applyTemplate("general")}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      Standard Acknowledgment
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("discovery")}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      Technical Discovery Call
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("quote")}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      Rate Card &amp; Scope
                    </button>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Recipient Email (Confirm/Edit)
                      </label>
                      <input
                        type="email"
                        value={replyRecipient}
                        onChange={(e) => setReplyRecipient(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-hidden font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Reply Email Subject
                      </label>
                      <input
                        type="text"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-hidden font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Tab content */}
                  {activeEditorTab === "compose" ? (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Full Description &amp; Email Content (HTML &amp; Rich Text)
                      </label>
                      <RichEmailEditor
                        value={replyContent}
                        onChange={setReplyContent}
                        placeholder="Write your detailed email message here..."
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Live Branded HTML Preview (Header, Content &amp; Footer)
                      </label>
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-4">
                        <div
                          className="bg-white rounded-xl shadow-xs overflow-hidden max-w-xl mx-auto"
                          dangerouslySetInnerHTML={{ __html: livePreviewHtml }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Current Status: <strong className="text-slate-800 capitalize">{activeMessage.status}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Close
                </button>
                {modalTab === "reply" && (
                  <button
                    type="button"
                    disabled={sendingReply}
                    onClick={handleSendReply}
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {sendingReply ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending Email...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Confirm &amp; Send Reply</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
