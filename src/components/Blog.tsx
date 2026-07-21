import { motion } from "motion/react";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";

const articles = [
  {
    title: "Mastering React Server Components",
    excerpt: "A deep dive into how RSCs are changing the way we build React applications and improving performance.",
    date: "Oct 12, 2023",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "#",
    category: "React"
  },
  {
    title: "Building Scalable APIs with Node.js",
    excerpt: "Learn the best practices for structuring your Express applications for scale and maintainability.",
    date: "Sep 28, 2023",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "#",
    category: "Backend"
  },
  {
    title: "The Future of CSS: Tailwind vs CSS-in-JS",
    excerpt: "Comparing the performance and developer experience of modern styling solutions in the frontend ecosystem.",
    date: "Sep 15, 2023",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "#",
    category: "Design"
  }
];

export default function Blog() {
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
            I occasionally write about web development, design patterns, and my journey as a software engineer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group glass-card overflow-hidden flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img
                  src={article.image}
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
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-display font-semibold mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-white/60 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                  {article.excerpt}
                </p>
                
                <a 
                  href={article.url}
                  className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors mt-auto"
                >
                  Read Article
                  <ArrowUpRight size={16} className="ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <a
            href="#"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white glass rounded-full hover:bg-white/10 transition-all"
          >
            View all articles on Dev.to
            <ArrowUpRight size={16} className="ml-2" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
