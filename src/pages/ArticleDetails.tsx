import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Loader2, Share2, Copy, Check, X, Twitter, Linkedin, Facebook, ArrowUpRight } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { Article } from "../types/article";
import { DEFAULT_ARTICLES } from "../data/defaultArticles";
import { getCachedArticles, saveArticlesToCache } from "../lib/articleUtils";
import ReactMarkdown from "react-markdown";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SafeImage from "../components/common/SafeImage";

const ease = [0.16, 1, 0.3, 1] as const;

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
    window.scrollTo(0, 0);
    if (!id) return;

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-900" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-zinc-950 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4 font-display">Article Not Found</h1>
        <p className="text-zinc-600 mb-8 max-w-md">
          The article you are looking for might have been removed or renamed.
        </p>
        <Link
          to="/#blog"
          className="px-6 py-3 bg-zinc-950 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          Back to Articles
        </Link>
      </div>
    );
  }

  const relatedArticles = allArticles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col">
      <Helmet>
        <title>{`${article.seo?.title || article.title} | Shakibul Islam Prohor`}</title>
        <meta name="description" content={article.seo?.description || article.excerpt} />
        <meta name="keywords" content={article.seo?.keywords || "Shakibul Islam Prohor, Blog, Technical Article, Web Development"} />
        <link rel="canonical" href={`https://shakibul-islam-portofolio.vercel.app/articles/${id}`} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Shakibul Islam Prohor Portfolio" />
        <meta property="og:url" content={`https://shakibul-islam-portofolio.vercel.app/articles/${id}`} />
        <meta property="og:title" content={article.seo?.title || article.title} />
        <meta property="og:description" content={article.seo?.description || article.excerpt} />
        <meta property="og:image" content={article.image || "https://shakibul-islam-portofolio.vercel.app/prohor-v2.png"} />
        <meta property="article:published_time" content={article.date} />
        <meta property="article:author" content={article.author || "Shakibul Islam Prohor"} />
        <meta property="article:section" content={article.category} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://shakibul-islam-portofolio.vercel.app/articles/${id}`} />
        <meta name="twitter:title" content={article.seo?.title || article.title} />
        <meta name="twitter:description" content={article.seo?.description || article.excerpt} />
        <meta name="twitter:image" content={article.image || "https://shakibul-islam-portofolio.vercel.app/prohor-v2.png"} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.title,
            description: article.seo?.description || article.excerpt,
            image: article.image || "https://shakibul-islam-portofolio.vercel.app/prohor-v2.png",
            datePublished: article.date,
            author: {
              "@type": "Person",
              name: article.author || "Shakibul Islam Prohor",
              url: "https://shakibul-islam-portofolio.vercel.app/",
            },
            publisher: {
              "@type": "Person",
              name: "Shakibul Islam Prohor",
              url: "https://shakibul-islam-portofolio.vercel.app/",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://shakibul-islam-portofolio.vercel.app/articles/${id}`,
            },
          })}
        </script>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-28 md:pt-32 pb-24 bg-white">
        <div className="container px-6 mx-auto max-w-4xl">
          <div className="flex items-center justify-between pb-6 mb-10 border-b border-zinc-200">
            <Link
              to="/#blog"
              className="inline-flex items-center text-zinc-600 hover:text-zinc-950 transition-colors group text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform duration-150" />
              Back to Articles
            </Link>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition-colors text-xs font-semibold text-zinc-800 cursor-pointer"
            >
              <Share2 size={14} className="text-blue-600" />
              <span>Share</span>
            </button>
          </div>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-medium mb-4 tabular-nums">
                <span className="text-blue-600 font-semibold">{article.category}</span>
                <span aria-hidden="true">·</span>
                <span>{article.author}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {new Date(article.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span aria-hidden="true">·</span>
                <span>{article.readingTime}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold font-display leading-[1.12] tracking-tight text-zinc-950 mb-6 [text-wrap:balance]">
                {article.title}
              </h1>

              <p className="text-lg text-zinc-600 leading-relaxed max-w-3xl">
                {article.excerpt}
              </p>
            </header>

            <div className="relative aspect-video rounded-2xl overflow-hidden mb-12 border border-zinc-200 bg-zinc-100">
              <SafeImage
                src={article.image}
                alt={article.title}
                fallbackTitle={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose max-w-[70ch] mx-auto mb-12">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="pt-8 border-t border-zinc-200 flex flex-wrap items-center gap-2 max-w-[70ch] mx-auto">
                <span className="text-xs font-semibold text-zinc-500 mr-1">Topics:</span>
                <span className="text-xs font-mono text-zinc-600">
                  {article.tags.join(" · ")}
                </span>
              </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-16 pt-12 border-t border-zinc-200">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold font-display text-zinc-950">
                      More Articles
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Explore additional technical articles and guides
                    </p>
                  </div>
                  <Link
                    to="/#blog"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    View All <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/articles/${rel.id}`}
                      className="group bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl overflow-hidden flex flex-col transition-colors"
                    >
                      <div className="h-36 overflow-hidden relative bg-zinc-100 border-b border-zinc-200">
                        <SafeImage
                          src={rel.image}
                          alt={rel.title}
                          fallbackTitle={rel.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <span className="text-[11px] font-medium text-zinc-500 mb-1.5">
                          {rel.category} · {rel.readingTime}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-950 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {rel.title}
                        </h4>
                        <p className="text-xs text-zinc-600 line-clamp-2 flex-1">
                          {rel.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.article>
        </div>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden border border-zinc-200 shadow-2xl"
            >
              <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-lg font-bold font-display text-zinc-950">Share Article</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 flex gap-3.5 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 shrink-0 bg-zinc-100">
                    <SafeImage src={article.image} alt={article.title} fallbackTitle={article.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-zinc-950 truncate">{article.title}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{article.excerpt}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500">Direct Link</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={window.location.href}
                      className="flex-grow px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-700 outline-none"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-4 py-2.5 bg-zinc-950 hover:bg-blue-600 text-white rounded-xl transition-colors cursor-pointer"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500">Social Networks</p>
                  <div className="grid grid-cols-3 gap-3">
                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1.5 p-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors text-zinc-800"
                    >
                      <Twitter size={20} className="text-sky-500" />
                      <span className="text-xs font-medium">Twitter</span>
                    </a>
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1.5 p-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors text-zinc-800"
                    >
                      <Facebook size={20} className="text-blue-600" />
                      <span className="text-xs font-medium">Facebook</span>
                    </a>
                    <a
                      href={shareLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1.5 p-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors text-zinc-800"
                    >
                      <Linkedin size={20} className="text-blue-700" />
                      <span className="text-xs font-medium">LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
