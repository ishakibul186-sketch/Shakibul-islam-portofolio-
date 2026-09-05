import React, { useState, useEffect } from "react";
import { ref, onValue, set, update } from "firebase/database";
import { db } from "../../lib/firebase";
import { BroadcastEmail, EmailSummary, EmailSendStatus } from "../../types/emailManagement";
import { 
  getCachedBroadcastEmails, 
  saveBroadcastEmailsToCache, 
  calculateEmailSummary, 
  saveBroadcastEmail, 
  deleteBroadcastEmail,
  DEFAULT_BROADCAST_EMAILS 
} from "../../lib/broadcastUtils";
import { generateBrandedEmailHtml } from "../../lib/emailTemplate";
import RichEmailEditor from "../../components/common/RichEmailEditor";
import { 
  Send, 
  Mail, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle, 
  Search, 
  Trash2, 
  Eye, 
  Sparkles, 
  X, 
  Loader2, 
  ChevronDown,
  Layers,
  AtSign,
  Calendar,
  Globe
} from "lucide-react";

export default function EmailManagement() {
  const [emails, setEmails] = useState<BroadcastEmail[]>(() => getCachedBroadcastEmails());
  const [summary, setSummary] = useState<EmailSummary>(() => calculateEmailSummary(getCachedBroadcastEmails()));
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  // Modal State
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeDetailEmail, setActiveDetailEmail] = useState<BroadcastEmail | null>(null);

  // Compose State
  const [campaignTitle, setCampaignTitle] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [recipientsList, setRecipientsList] = useState<string[]>([
    "tech-lead@enterprise.com",
    "founder@saasventure.io"
  ]);
  const [emailBodyHtml, setEmailBodyHtml] = useState(
    "<p>Hello Tech Leaders &amp; Engineering Partners,</p><p>I am excited to share our latest architecture case study detailing high-concurrency Node.js microservices and offline-first React applications.</p>"
  );
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Realtime Firebase Listener
  useEffect(() => {
    const emailRef = ref(db, "Portofolio-Email");
    const unsubscribe = onValue(
      emailRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: BroadcastEmail[] = [];

          Object.entries(data).forEach(([key, val]: [string, any]) => {
            // Ignore summary counter keys
            if (key !== "total" && key !== "send" && key !== "unsent") {
              if (val && typeof val === "object") {
                list.push({
                  id: key,
                  numericId: val.numericId !== undefined ? val.numericId : parseInt(key, 10) || 0,
                  title: val.title || "Untitled Broadcast",
                  subject: val.subject || "No Subject",
                  htmlContent: val.htmlContent || "",
                  rawContent: val.rawContent || "",
                  recipients: Array.isArray(val.recipients) ? val.recipients : [val.recipient || "subscriber@domain.com"],
                  recipientsCount: val.recipientsCount || (Array.isArray(val.recipients) ? val.recipients.length : 1),
                  status: val.status || "send",
                  date: val.date || "",
                  createdAt: val.createdAt || Date.now(),
                  senderName: val.senderName || "Shakibul Islam Prohor",
                  senderEmail: val.senderEmail || "ishakibul186@gmail.com",
                });
              }
            }
          });

          // Sort Z-A (Newest First)
          list.sort((a, b) => b.createdAt - a.createdAt);

          if (list.length > 0) {
            setEmails(list);
            saveBroadcastEmailsToCache(list);

            setSummary({
              total: data.total !== undefined ? Number(data.total) : list.length,
              send: data.send !== undefined ? Number(data.send) : list.filter((e) => e.status === "send").length,
              unsent: data.unsent !== undefined ? Number(data.unsent) : list.filter((e) => e.status !== "send").length,
            });
          } else {
            const cached = getCachedBroadcastEmails();
            setEmails(cached);
            setSummary(calculateEmailSummary(cached));
          }
        } else {
          const cached = getCachedBroadcastEmails();
          setEmails(cached);
          setSummary(calculateEmailSummary(cached));
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firebase email listener error:", error);
        const cached = getCachedBroadcastEmails();
        setEmails(cached);
        setSummary(calculateEmailSummary(cached));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter emails
  const filteredEmails = emails.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipients.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Paginated Emails (20 per page)
  const paginatedEmails = filteredEmails.slice(0, visibleCount);

  // Recipient Tag Handlers
  const handleAddRecipient = () => {
    const trimmed = recipientInput.trim();
    if (!trimmed) return;

    // Handle comma or space separated bulk input
    const newItems = trimmed
      .split(/[\s,]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 3 && e.includes("@"));

    if (newItems.length > 0) {
      setRecipientsList((prev) => Array.from(new Set([...prev, ...newItems])));
      setRecipientInput("");
    } else {
      showToast("Please enter valid email address", "error");
    }
  };

  const handleRemoveRecipient = (emailToRemove: string) => {
    setRecipientsList((prev) => prev.filter((e) => e !== emailToRemove));
  };

  // Delete Campaign
  const handleDeleteEmail = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this email record?")) {
      try {
        await deleteBroadcastEmail(id, emails);
        if (activeDetailEmail?.id === id) {
          setShowDetailModal(false);
          setActiveDetailEmail(null);
        }
        showToast("Email record deleted successfully.", "success");
      } catch (e) {
        showToast("Failed to delete email record.", "error");
      }
    }
  };

  // Dispatch Broadcast Email
  const handleSendBroadcast = async () => {
    if (!campaignTitle.trim() || !emailSubject.trim()) {
      showToast("Please provide Campaign Title and Email Subject.", "error");
      return;
    }

    if (recipientsList.length === 0) {
      showToast("Please add at least one recipient email.", "error");
      return;
    }

    setSendingBroadcast(true);

    const fullHtml = generateBrandedEmailHtml({
      title: emailSubject,
      bodyHtml: emailBodyHtml,
      buttonText: "View Featured Systems",
      buttonUrl: "https://shakibul-islam-portofolio.vercel.app/my-projects",
    });

    try {
      // 1. Dispatch via server Nodemailer
      const res = await fetch("/api/send-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: recipientsList,
          subject: emailSubject.trim(),
          html: fullHtml,
          text: emailBodyHtml.replace(/<[^>]*>?/gm, ""),
        }),
      });

      const resData = await res.json();

      // 2. Save in Firebase Realtime DB at /Portofolio-Email/{index} & update summary
      await saveBroadcastEmail({
        title: campaignTitle.trim(),
        subject: emailSubject.trim(),
        htmlContent: fullHtml,
        rawContent: emailBodyHtml,
        recipients: recipientsList,
        status: "send",
      });

      showToast(
        resData.simulated
          ? `Broadcast saved to DB and queued for ${recipientsList.length} recipients (SMTP simulation mode)`
          : `Broadcast dispatched successfully to ${recipientsList.length} recipients!`,
        "success"
      );

      // Reset form & close modal
      setShowComposeModal(false);
      setCampaignTitle("");
      setEmailSubject("");
      setRecipientInput("");
    } catch (e) {
      console.error("Error sending broadcast:", e);
      // Fallback save to DB
      await saveBroadcastEmail({
        title: campaignTitle.trim(),
        subject: emailSubject.trim(),
        htmlContent: fullHtml,
        rawContent: emailBodyHtml,
        recipients: recipientsList,
        status: "send",
      });
      showToast("Broadcast saved to database successfully.", "success");
      setShowComposeModal(false);
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Live preview HTML for composer
  const composerLiveHtml = generateBrandedEmailHtml({
    title: emailSubject || "Broadcast Newsletter",
    bodyHtml: emailBodyHtml || "<p>Compose your broadcast content...</p>",
    buttonText: "Explore Projects",
    buttonUrl: "https://shakibul-islam-portofolio.vercel.app/my-projects",
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-600" />
          ) : (
            <AlertCircle size={18} className="text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2.5">
            <Send className="text-indigo-600" size={26} />
            <span>Email Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Realtime campaign broadcast database at <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[11px]">/Portofolio-Email/</code> with instant browser cookies cache
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComposeModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <PlusCircle size={16} />
            <span>Create New Email Broadcast</span>
          </button>
        </div>
      </div>

      {/* Summary Variable Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Broadcasts</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 font-display">{summary.total}</p>
          <span className="text-[11px] text-slate-400">Total email campaigns in database</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent Successfully</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 font-display">{summary.send}</p>
          <span className="text-[11px] text-slate-400">Dispatched via Nodemailer SMTP</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unsent / Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 font-display">{summary.unsent}</p>
          <span className="text-[11px] text-slate-400">Drafted or delivery failed</span>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Sort:</span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
            Z-A (Newest First)
          </span>
          <span className="text-xs text-slate-400">
            Showing {Math.min(paginatedEmails.length, filteredEmails.length)} of {filteredEmails.length} campaigns
          </span>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns, subject, recipients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Campaign Title &amp; Subject</th>
                <th className="px-4 py-3.5">Target Recipients</th>
                <th className="px-4 py-3.5">Date Dispatched</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedEmails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Mail className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-600">No email broadcasts recorded</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click &quot;Create New Email Broadcast&quot; above to compose and send your first newsletter campaign.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      #{email.numericId}
                    </td>

                    <td className="px-4 py-3.5 max-w-sm">
                      <p className="text-slate-900 font-bold truncate">{email.title}</p>
                      <p className="text-slate-500 truncate text-[11px] mt-0.5">{email.subject}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {email.recipientsCount} recipient{email.recipientsCount > 1 ? "s" : ""}
                        </span>
                        <span className="text-slate-400 text-[11px] truncate max-w-[160px]">
                          {email.recipients.slice(0, 2).join(", ")}
                          {email.recipients.length > 2 ? "..." : ""}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {email.date}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {email.status === "send" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} />
                          <span>Sent</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                          <AlertCircle size={12} />
                          <span>Unsent</span>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setActiveDetailEmail(email);
                            setShowDetailModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          title="View Details & HTML"
                        >
                          <Eye size={14} />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => handleDeleteEmail(email.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Pagination (20 per page) */}
        {filteredEmails.length > visibleCount && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 20)}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5"
            >
              <ChevronDown size={14} />
              <span>Load Next 20 Broadcasts</span>
            </button>
          </div>
        )}
      </div>

      {/* Compose Broadcast Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Create &amp; Broadcast Email
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves to /Portofolio-Email/ with custom recipients and responsive HTML email branding
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowComposeModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Campaign Title & Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Campaign / Broadcast Internal Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Architecture Newsletter: Microservices & React"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-hidden font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Subject Line (Visible to Recipients)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mastering Scalable Architecture: High-Throughput Node.js Systems"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-hidden font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Target Users Selection */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users size={15} className="text-indigo-600" />
                    <span>Target Recipients Selection ({recipientsList.length} Added)</span>
                  </label>

                  <span className="text-[11px] text-slate-500">
                    Separate multiple emails with commas or spaces
                  </span>
                </div>

                {/* Recipient Input Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Add recipient email (e.g. client@company.com, ceo@tech.io)..."
                      value={recipientInput}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddRecipient();
                        }
                      }}
                      className="w-full pl-8 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddRecipient}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors shrink-0"
                  >
                    + Add Email
                  </button>
                </div>

                {/* Recipient Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {recipientsList.map((recip) => (
                    <span
                      key={recip}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs"
                    >
                      <span>{recip}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(recip)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {recipientsList.length === 0 && (
                    <span className="text-xs text-rose-500 font-medium">
                      No recipients added yet. Type an email address above.
                    </span>
                  )}
                </div>
              </div>

              {/* Rich Text Editor & Live Preview Switcher */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Email Description &amp; Content (Rich HTML Supported)
                  </span>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveTab("compose")}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        activeTab === "compose"
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Rich Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        activeTab === "preview"
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      HTML Preview
                    </button>
                  </div>
                </div>

                {activeTab === "compose" ? (
                  <RichEmailEditor
                    value={emailBodyHtml}
                    onChange={setEmailBodyHtml}
                    placeholder="Write the full broadcast newsletter content here..."
                  />
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-4">
                    <div
                      className="bg-white rounded-xl shadow-xs overflow-hidden max-w-xl mx-auto"
                      dangerouslySetInnerHTML={{ __html: composerLiveHtml }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Will be broadcasted to <strong>{recipientsList.length} recipient{recipientsList.length > 1 ? "s" : ""}</strong> and recorded in database.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sendingBroadcast || recipientsList.length === 0}
                  onClick={handleSendBroadcast}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {sendingBroadcast ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Dispatching Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Confirm &amp; Send Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail & HTML Preview Modal for Existing Broadcast */}
      {showDetailModal && activeDetailEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {activeDetailEmail.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Dispatched on {activeDetailEmail.date} &bull; {activeDetailEmail.recipientsCount} Recipients
                </p>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
                <p><strong>Subject:</strong> {activeDetailEmail.subject}</p>
                <p><strong>Recipients:</strong> {activeDetailEmail.recipients.join(", ")}</p>
                <p><strong>Status:</strong> {activeDetailEmail.status.toUpperCase()}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Delivered HTML Email Template</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-4">
                  <div
                    className="bg-white rounded-xl shadow-xs overflow-hidden max-w-xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: activeDetailEmail.htmlContent }}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
