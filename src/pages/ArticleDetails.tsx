import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, User, ArrowLeft, Loader2, Tag, Share2, Copy, Check, X, Twitter, Linkedin, Facebook, ArrowUpRight } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { Article } from "../types/article";
import { DEFAULT_ARTICLES } from "../data/defaultArticles";
import { getCachedArticles, saveArticlesToCache } from "../lib/articleUtils";
import ReactMarkdown from "react-markdown";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ArticleDetails() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(() => {
    const cached = getCachedArticles();
    return cached.find((a) => a.id === id || a.slug === id) || DEFAULT_ARTICLES.find((a) => a.id === id || a.slug === id) || null;
  });
  const [allArticles, setAllArticles] = useState<Article[]>(() => getCachedArticles());
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Check cached first
    const cachedArticles = getCachedArticles();
    const cachedMatch = cachedArticles.find((a) => a.id === id || a.slug === id) || DEFAULT_ARTICLES.find((a) => a.id === id || a.slug === id);
    if (cachedMatch) {
      setArticle(cachedMatch);
    }

    const articleRef = ref(db, `articles/${id}`);
    const unsubscribe = onValue(
      articleRef, 
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setArticle(val);
        } else if (cachedMatch) {
          setArticle(cachedMatch);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching article from Firebase:", err);
        if (cachedMatch) {
          setArticle(cachedMatch);
        }
        setLoading(false);
      }
    );

    // Also load other articles for recommendation
    const allRef = ref(db, "articles");
    const unsubAll = onValue(allRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const list = Object.entries(val).map(([aid, item]) => ({
          id: aid,
          ...(item as any),
        }));
        if (list.length > 0) {
          setAllArticles(list);
          saveArticlesToCache(list);
        }
      }
    });

    return () => {
      unsubscribe();
      unsubAll();
    };
  }, [id]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article?.title || "")}&url=${encodeURIComponent(window.location.href)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
  };

  if (loading && !article) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-white px-6 text-center">
        <h1 className="text-4xl font-bold mb-4 font-display">Article Not Found</h1>
        <p className="text-white/60 mb-8 max-w-md">The article you are looking for might have been removed or renamed.</p>
        <Link to="/#blog" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-medium shadow-lg shadow-purple-600/30">
          Back to Blog
        </Link>
      </div>
    );
  }

  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      <Helmet>
        <title>{`${article.seo?.title || article.title} | Shakibul Islam Prohor`}</title>
        <meta name="description" content={article.seo?.description || article.excerpt} />
        <meta name="keywords" content={article.seo?.keywords || "Shakibul Islam Prohor, Blog, Technical Article, Web Development"} />
        <link rel="canonical" href={`https://shakibul-islam-portofolio.vercel.app/articles/${id}`} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Shakibul Islam Prohor Portfolio" />
        <meta property="og:url" content={`https://shakibul-islam-portofolio.vercel.app/articles/${id}`} />
        <meta property="og:title" content={article.seo?.title || article.title} />
        <meta property="og:description" content={article.seo?.description || article.excerpt} />
        <meta property="og:image" content={article.image || "https://shakibul-islam-portofolio.vercel.app/prohor.png"} />
        <meta property="article:published_time" content={article.date} />
        <meta property="article:author" content={article.author || "Shakibul Islam Prohor"} />
        <meta property="article:section" content={article.category} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://shakibul-islam-portofolio.vercel.app/articles/${id}`} />
        <meta name="twitter:title" content={article.seo?.title || article.title} />
        <meta name="twitter:description" content={article.seo?.description || article.excerpt} />
        <meta name="twitter:image" content={article.image || "https://shakibul-islam-portofolio.vercel.app/prohor.png"} />

        {/* Schema.org BlogPosting Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": article.title,
            "description": article.seo?.description || article.excerpt,
            "image": article.image || "https://shakibul-islam-portofolio.vercel.app/prohor.png",
            "datePublished": article.date,
            "author": {
              "@type": "Person",
              "name": article.author || "Shakibul Islam Prohor",
              "url": "https://shakibul-islam-portofolio.vercel.app/"
            },
            "publisher": {
              "@type": "Person",
              "name": "Shakibul Islam Prohor",
              "url": "https://shakibul-islam-portofolio.vercel.app/"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://shakibul-islam-portofolio.vercel.app/articles/${id}`
            }
          })}
        </script>
      </Helmet>

      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container px-6 mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors group">
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            
            <button 
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm font-medium"
            >
              <Share2 size={16} className="text-purple-400" />
              Share
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <span className="px-3 py-1 text-xs font-medium text-cyan-400 bg-cyan-400/10 rounded-full border border-cyan-400/20 mb-4 inline-block">
                {article.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight mb-6">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-purple-400" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-cyan-400" />
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-pink-400" />
                  <span>{article.readingTime}</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 glass-card border border-white/10">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose prose-invert prose-purple max-w-none mb-12">
              <div className="text-white/80 leading-relaxed text-lg space-y-6">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-white/40 mr-2">
                <Tag size={16} />
                <span className="text-sm">Tags:</span>
              </div>
              {article.tags?.map((tag, i) => (
                <span key={i} className="px-3 py-1 text-xs text-white/60 bg-white/5 rounded-full border border-white/10">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Related Articles Section */}
            {relatedArticles.length > 0 && (
              <div className="mt-16 pt-12 border-t border-white/10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold font-display text-white">
                      More <span className="text-gradient">Articles</span>
                    </h3>
                    <p className="text-xs text-white/50 mt-1">Explore more technical breakdowns and architecture guides</p>
                  </div>
                  <Link
                    to="/#blog"
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                  >
                    View All <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/articles/${rel.id}`}
                      className="group glass-card rounded-2xl overflow-hidden flex flex-col hover:border-purple-500/40 transition-all"
                    >
                      <div className="h-36 overflow-hidden relative">
                        <img
                          src={rel.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop"}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-semibold bg-black/60 backdrop-blur-md rounded-full text-white/90 border border-white/10">
                          {rel.category}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                          {rel.title}
                        </h4>
                        <p className="text-xs text-white/50 line-clamp-2 flex-1 mb-3">
                          {rel.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5 mt-auto">
                          <span>{rel.readingTime}</span>
                          <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                            Read <ArrowUpRight size={12} className="ml-0.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0a0a1a] w-full max-w-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold font-display">Share Article</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Preview */}
                <div className="glass-card p-4 flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <img src={article.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{article.title}</p>
                    <p className="text-xs text-white/40 line-clamp-2 mt-1">{article.excerpt}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/30">Direct Link</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={window.location.href}
                      className="flex-grow px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white/60 outline-none"
                    />
                    <button 
                      onClick={handleCopyUrl}
                      className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/30">Social Networks</p>
                  <div className="grid grid-cols-3 gap-4">
                    <a 
                      href={shareLinks.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 glass-card hover:bg-white/5 transition-all group"
                    >
                      <Twitter size={24} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold">Twitter</span>
                    </a>
                    <a 
                      href={shareLinks.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 glass-card hover:bg-white/5 transition-all group"
                    >
                      <Facebook size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold">Facebook</span>
                    </a>
                    <a 
                      href={shareLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 glass-card hover:bg-white/5 transition-all group"
                    >
                      <Linkedin size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold">LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 text-center">
                <p className="text-[10px] text-white/20">Sharing improves visibility for the author!</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
