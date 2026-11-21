import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { ref, onValue, query, orderByKey, limitToLast } from "firebase/database";
import { db } from "../lib/firebase";
import { Article } from "../types/article";
import { DEFAULT_ARTICLES } from "../data/defaultArticles";
import { getCachedArticles, saveArticlesToCache } from "../lib/articleUtils";
import { Link } from "react-router-dom";
import SafeImage from "./common/SafeImage";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Blog() {
  const [articles, setArticles] = useState<Article[]>(() => {
    const cached = getCachedArticles();
    return cached.length > 0 ? cached.slice(0, 6) : DEFAULT_ARTICLES.slice(0, 6);
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const articlesRef = query(ref(db, "articles"), orderByKey(), limitToLast(6));

    const unsubscribe = onValue(
      articlesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const articleList = Object.entries(data)
            .map(([id, value]) => ({
              id,
              ...(value as any),
            }))
            .reverse() as Article[];
          if (articleList.length > 0) {
            setArticles(articleList);
            saveArticlesToCache(articleList);
          } else {
            const cached = getCachedArticles();
            setArticles(cached.slice(0, 6));
          }
        } else {
          const cached = getCachedArticles();
          setArticles(cached.slice(0, 6));
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firebase articles fetch error:", error);
        const cached = getCachedArticles();
        setArticles(cached.slice(0, 6));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section id="blog" className="py-14 md:py-20 bg-zinc-50/60 border-b border-zinc-200">
      <div className="container px-4 sm:px-6 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4"
        >
          <div>
            <p className="text-xs font-semibold text-blue-600 tracking-wide mb-1.5">
              05. Writing &amp; Insights
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight text-zinc-950">
              Latest Articles
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
            Technical breakdowns on full-stack architecture, performance engineering, and modern React patterns.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.06, ease }}
                className="group bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl overflow-hidden flex flex-col h-full transition-colors duration-200"
              >
                <Link
                  to={`/articles/${article.id}`}
                  className="relative h-40 sm:h-44 overflow-hidden bg-zinc-100 border-b border-zinc-200 block"
                >
                  <SafeImage
                    src={article.image}
                    alt={article.title}
                    fallbackTitle={article.title}
                    className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </Link>

                <div className="p-5 flex flex-col flex-grow">
                  {/* Unboxed Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-2 tabular-nums">
                    <span className="font-medium text-zinc-800">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {new Date(article.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readingTime}</span>
                  </div>

                  <Link to={`/articles/${article.id}`}>
                    <h3 className="text-base sm:text-lg font-display font-bold text-zinc-950 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {article.excerpt}
                  </p>

                  <Link
                    to={`/articles/${article.id}`}
                    className="inline-flex items-center text-xs font-semibold text-zinc-950 hover:text-blue-600 transition-colors mt-auto pt-3 border-t border-zinc-100"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight
                      size={14}
                      className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150"
                    />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-14 text-zinc-400">
            No articles published yet.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2, ease }}
          className="mt-8 text-center"
        >
          <a
            href="https://dev.to/prohor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-zinc-800 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <span>More Writing on Dev.to</span>
            <ArrowUpRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
