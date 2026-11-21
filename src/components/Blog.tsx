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
    <section id="blog" className="py-24 bg-zinc-50/60 border-b border-zinc-200">
      <div className="container px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
          <div>
            <p className="text-xs font-semibold text-blue-600 tracking-wide mb-2">
              05. Writing &amp; Insights
            </p>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-zinc-950">
              Latest Articles
            </h2>
          </div>

          <p className="text-sm text-zinc-500 max-w-md">
            Technical breakdowns on full-stack architecture, performance engineering, and modern React patterns.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
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
                  className="relative h-48 overflow-hidden bg-zinc-100 border-b border-zinc-200 block"
                >
                  <SafeImage
                    src={article.image}
                    alt={article.title}
                    fallbackTitle={article.title}
                    className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </Link>

                <div className="p-6 flex flex-col flex-grow">
                  {/* Unboxed Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-3 tabular-nums">
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
                    <h3 className="text-lg font-display font-bold text-zinc-950 mb-2.5 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="text-zinc-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                    {article.excerpt}
                  </p>

                  <Link
                    to={`/articles/${article.id}`}
                    className="inline-flex items-center text-xs font-semibold text-zinc-950 hover:text-blue-600 transition-colors mt-auto pt-4 border-t border-zinc-100"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight
                      size={15}
                      className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150"
                    />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-400">
            No articles published yet.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2, ease }}
          className="mt-12 text-center"
        >
          <a
            href="https://dev.to/prohor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-zinc-800 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <span>More Writing on Dev.to</span>
            <ArrowUpRight size={15} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
