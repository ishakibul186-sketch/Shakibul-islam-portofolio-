import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, onValue, remove, set } from "firebase/database";
import { db } from "../../lib/firebase";
import { Article } from "../../types/article";
import { DEFAULT_ARTICLES } from "../../data/defaultArticles";
import { getCachedArticles, saveArticlesToCache } from "../../lib/articleUtils";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  TrendingUp, 
  Clock, 
  Calendar, 
  FolderGit2, 
  Sparkles,
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>(() => getCachedArticles());
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedModalOpen, setSeedModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  useEffect(() => {
    const articlesRef = ref(db, "articles");
    const unsubscribe = onValue(
      articlesRef, 
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([id, value]) => ({
            id,
            ...(value as any),
          })).reverse() as Article[];
          
          if (list.length > 0) {
            setArticles(list);
            saveArticlesToCache(list);
          } else {
            const cached = getCachedArticles();
            setArticles(cached);
          }
        } else {
          const cached = getCachedArticles();
          setArticles(cached);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error loading articles from Firebase:", err);
        const cached = getCachedArticles();
        setArticles(cached);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await remove(ref(db, `articles/${id}`));
      setArticles((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        saveArticlesToCache(updated);
        return updated;
      });
      setDeleteConfirmId(null);
      showToast("Article deleted successfully.", "success");
    } catch (err) {
      console.error("Failed to delete article:", err);
      showToast("Failed to delete article from database.", "error");
    }
  };

  // Seed / Write 7 Default Articles to Firebase Realtime DB
  const executeSeedArticles = async () => {
    setSeeding(true);
    try {
      for (const art of DEFAULT_ARTICLES) {
        const artRef = ref(db, `articles/${art.id}`);
        await set(artRef, {
          ...art,
          createdAt: art.createdAt || Date.now(),
        });
      }
      
      saveArticlesToCache(DEFAULT_ARTICLES);
      setArticles(DEFAULT_ARTICLES);
      setSeedModalOpen(false);
      showToast(`Successfully seeded all ${DEFAULT_ARTICLES.length} professional articles to your Firebase database!`, "success");
    } catch (error: any) {
      console.error("Error seeding articles:", error);
      showToast("Failed to seed articles: " + (error?.message || "Please check your network"), "error");
    } finally {
      setSeeding(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const date = new Date(article.date || Date.now());
    const month = isNaN(date.getTime()) ? "all" : date.getMonth().toString();
    const year = isNaN(date.getTime()) ? "all" : date.getFullYear().toString();
    
    const matchesMonth = filterMonth === "all" || month === filterMonth;
    const matchesYear = filterYear === "all" || year === filterYear;
    const matchesSearch = 
      (article.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesMonth && matchesYear && matchesSearch;
  });

  const currentMonthArticles = articles.filter(article => {
    const date = new Date(article.date || Date.now());
    if (isNaN(date.getTime())) return false;
    return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Articles Management
          </h1>
          <p className="text-xs text-slate-500">
            Draft, publish, and manage your technical articles & engineering tutorials
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSeedModalOpen(true)}
            disabled={seeding}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            title={`Seed ${DEFAULT_ARTICLES.length} pre-written professional articles into Firebase`}
          >
            {seeding ? (
              <Loader2 size={15} className="animate-spin text-indigo-600" />
            ) : (
              <Database size={15} className="text-indigo-600" />
            )}
            <span>{seeding ? "Seeding..." : `Seed ${DEFAULT_ARTICLES.length} Default Articles`}</span>
          </button>

          <Link
            to="/admin/projects"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <FolderGit2 size={15} />
            <span>Manage Projects</span>
          </Link>
          <Link 
            to="/admin/articles/add"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>New Article</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Articles</p>
            <p className="text-2xl font-bold text-slate-900">{articles.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month</p>
            <p className="text-2xl font-bold text-slate-900">{currentMonthArticles.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Read</p>
            <p className="text-2xl font-bold text-slate-900">~6.5 min</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search articles by title, topic, or category..." 
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select 
                className="pl-3 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 appearance-none text-slate-700"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="all">All Months</option>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                  <option key={m} value={i.toString()}>{m}</option>
                ))}
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
            <div className="relative">
              <select 
                className="pl-3 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 appearance-none text-slate-700"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="all">All Years</option>
                {["2024", "2025", "2026", "2027"].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Articles</span>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-200 text-slate-700 rounded-full">
              {filteredArticles.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles size={13} className="text-indigo-600" /> Realtime Database
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Article</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Date & Read Time</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="animate-spin text-indigo-600 mx-auto mb-2" size={24} />
                    <span className="text-xs">Loading articles...</span>
                  </td>
                </tr>
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {article.image ? (
                            <img src={article.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <FileText size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs md:max-w-md">
                          <p className="font-bold text-slate-900 truncate">{article.title}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{article.slug || article.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-slate-700">
                        {article.date ? new Date(article.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{article.readingTime || "5 min read"}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link 
                          to={`/articles/${article.id}`} 
                          target="_blank"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Preview Public Page"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          to={`/admin/articles/edit/${article.id}`}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Article"
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button 
                          onClick={() => setDeleteConfirmId(article.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs">
                    <p className="italic">No articles found matching your filters.</p>
                    <button
                      onClick={() => setSeedModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Database size={13} /> Seed {DEFAULT_ARTICLES.length} Default Articles
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete this article?</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              This action will remove the article from your Firebase database and public blog.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seed Default Articles Modal */}
      {seedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 md:p-7 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 mb-4">
              <Database size={24} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-display">
              Seed {DEFAULT_ARTICLES.length} Professional Articles to Database?
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              This will write {DEFAULT_ARTICLES.length} comprehensive, engineering-focused articles with full markdown body, code snippets, tags, reading time, and SEO metadata directly into your Firebase Realtime Database:
            </p>

            {/* List of 7 articles */}
            <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
              {DEFAULT_ARTICLES.map((a, idx) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{a.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{a.category} • {a.readingTime} • {a.tags?.slice(0, 3).join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSeedModalOpen(false)}
                disabled={seeding}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSeedArticles}
                disabled={seeding}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all inline-flex items-center gap-2"
              >
                {seeding ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Writing to Database...</span>
                  </>
                ) : (
                  <>
                    <Database size={15} />
                    <span>Yes, Seed All {DEFAULT_ARTICLES.length} Articles</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 max-w-md">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md ${
              toast.type === "success"
                ? "bg-slate-900/95 text-white border-slate-800"
                : "bg-red-900/95 text-white border-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
            )}
            <p className="flex-1">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

