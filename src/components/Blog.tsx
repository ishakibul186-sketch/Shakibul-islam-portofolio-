import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Calendar, Clock, Loader2 } from "lucide-react";
import { ref, onValue, query, orderByKey, limitToLast } from "firebase/database";
import { db } from "../lib/firebase";
import { Article } from "../types/article";
import { DEFAULT_ARTICLES } from "../data/defaultArticles";
import { getCachedArticles, saveArticlesToCache } from "../lib/articleUtils";
import { Link } from "react-router-dom";

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
          const articleList = Object.entries(data).map(([id, value]) => ({
            id,
            ...(value as any),
          })).reverse() as Article[];
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
    <section id="blog" className="py-24 relative">
      <div className="container px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">Latest <span className="text-gradient">Articles</span></h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full" />
          <p className="mt-6 text-white/60 max-w-2xl mx-auto">
            I write about web development, design patterns, and my journey as a software engineer.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group glass-card overflow-hidden flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img
                    src={article.image || "https://via.placeholder.com/800x450?text=No+Image"}
                    alt={article.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                      {article.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{article.readingTime}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-display font-semibold mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-white/60 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                    {article.excerpt}
                  </p>
                  
                  <Link 
                    to={`/articles/${article.id}`}
                    className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors mt-auto"
                  >
                    Read Article
                    <ArrowUpRight size={16} className="ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/40">
            No articles published yet.
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <a
            href="https://dev.to/prohor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white glass rounded-full hover:bg-white/10 transition-all"
          >
            View more on Dev.to
            <ArrowUpRight size={16} className="ml-2" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

