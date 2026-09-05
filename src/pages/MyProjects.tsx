import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { Project } from "../types/project";
import { 
  getCachedProjects, 
  saveProjectsToCache, 
  sortProjectsZA 
} from "../lib/projectUtils";
import { DEFAULT_PROJECTS } from "../data/defaultProjects";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  FolderGit2, 
  ExternalLink, 
  Github, 
  ArrowRight, 
  Search, 
  Sparkles, 
  Layers, 
  Clock, 
  ArrowLeft,
  Filter,
  CheckCircle2
} from "lucide-react";

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>(() => getCachedProjects());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const projectsRef = ref(db, "projects");
    const unsubscribe = onValue(
      projectsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: Project[] = [];

          Object.keys(data).forEach((key) => {
            if (key !== "totalstring" && typeof data[key] === "object" && data[key] !== null) {
              list.push({
                ...data[key],
                id: key,
                features: data[key].features || [],
                coreServices: data[key].coreServices || [],
                images: data[key].images || [],
              });
            }
          });

          if (list.length > 0) {
            const sorted = sortProjectsZA(list);
            setProjects(sorted);
            saveProjectsToCache(sorted);
          } else {
            setProjects(DEFAULT_PROJECTS);
          }
        } else {
          setProjects(DEFAULT_PROJECTS);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setProjects((prev) => (prev.length > 0 ? prev : DEFAULT_PROJECTS));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category || "Full Stack")))];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.coreServices?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || (project.category || "Full Stack") === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#030014] text-white flex flex-col selection:bg-purple-500/30">
      <Helmet>
        <title>My Projects & Software Portfolio | Shakibul Islam Prohor</title>
        <meta 
          name="description" 
          content="Explore full stack web applications, AI systems, and production software engineered by Shakibul Islam Prohor using React, TypeScript, Node.js, Firebase, and modern cloud technologies." 
        />
        <meta name="keywords" content="Shakibul Islam Prohor Projects, Full Stack Portfolio, React Web Apps, Node.js Projects, Firebase Applications, Software Engineer Bangladesh, Prohor Projects" />
        <link rel="canonical" href="https://shakibul-islam-portofolio.vercel.app/my-projects" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Shakibul Islam Prohor Portfolio" />
        <meta property="og:title" content="My Projects & Software Portfolio | Shakibul Islam Prohor" />
        <meta property="og:description" content="Explore full stack web applications, AI systems, and production software engineered by Shakibul Islam Prohor." />
        <meta property="og:url" content="https://shakibul-islam-portofolio.vercel.app/my-projects" />
        <meta property="og:image" content="https://shakibul-islam-portofolio.vercel.app/prohor.png" />
        <meta property="og:image:alt" content="Shakibul Islam Prohor Projects Showcase" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My Projects & Software Portfolio | Shakibul Islam Prohor" />
        <meta name="twitter:description" content="Explore full stack web applications, AI systems, and production software built by Shakibul Islam Prohor." />
        <meta name="twitter:image" content="https://shakibul-islam-portofolio.vercel.app/prohor.png" />

        {/* Schema.org CollectionPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "My Projects | Shakibul Islam Prohor Portfolio",
            "url": "https://shakibul-islam-portofolio.vercel.app/my-projects",
            "description": "Showcase of web apps, full-stack projects, and software by Shakibul Islam Prohor.",
            "author": {
              "@type": "Person",
              "name": "Shakibul Islam Prohor",
              "url": "https://shakibul-islam-portofolio.vercel.app/"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://shakibul-islam-portofolio.vercel.app/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "My Projects",
                  "item": "https://shakibul-islam-portofolio.vercel.app/my-projects"
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container px-6 mx-auto max-w-7xl relative z-10">
          {/* Top Breadcrumb / Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-white/50 hover:text-white transition-colors group text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <span className="text-xs text-white/40 font-mono flex items-center gap-1.5">
              <Sparkles size={13} className="text-purple-400" />
              Z-A Indexed Live ({projects.length} Total)
            </span>
          </div>

          {/* Header Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <FolderGit2 size={14} />
              Portfolio Showcase
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight mb-4">
              My <span className="text-gradient">Projects</span>
            </h1>
            <p className="text-white/60 text-base md:text-lg leading-relaxed">
              A curated collection of web applications, AI integrations, cloud solutions, and open-source contributions crafted with precision.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <div className="glass-card p-4 md:p-6 mb-12 border border-white/10 rounded-3xl space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="w-full md:max-w-md relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search projects or tech stack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-600/20"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid (Z-A Latest First) */}
          {loading && projects.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card rounded-3xl overflow-hidden animate-pulse border border-white/5">
                  <div className="aspect-video bg-white/5" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-white/10 rounded w-2/3" />
                    <div className="h-4 bg-white/5 rounded w-full" />
                    <div className="h-4 bg-white/5 rounded w-4/5" />
                    <div className="pt-4 flex gap-2">
                      <div className="h-6 w-16 bg-white/5 rounded-full" />
                      <div className="h-6 w-16 bg-white/5 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl p-8 max-w-xl mx-auto border border-white/10">
              <FolderGit2 size={48} className="text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold font-display">No Projects Found</h3>
              <p className="text-white/50 text-sm mt-2">
                {searchQuery || selectedCategory !== "All"
                  ? "Try resetting your search query or category filter."
                  : "No projects have been published yet. Check back soon!"}
              </p>
              {(searchQuery || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-purple-500/40 transition-all flex flex-col hover:shadow-[0_0_30px_rgba(112,0,255,0.15)]"
                >
                  {/* Thumbnail Container */}
                  <Link
                    to={`/my-projects/${project.id}`}
                    className="relative aspect-video overflow-hidden block bg-black/40"
                  >
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent opacity-80" />

                    {/* Category & Status badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/10">
                        {project.category || "Full Stack"}
                      </span>
                    </div>

                    {project.status && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {project.status}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/my-projects/${project.id}`}>
                        <h3 className="text-xl font-bold font-display group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                      </Link>

                      <p className="text-white/60 text-xs md:text-sm mt-2 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Core Services / Tech Stack Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {project.coreServices?.slice(0, 4).map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 text-[11px] font-medium text-purple-300 bg-purple-500/10 rounded-lg border border-purple-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                        {(project.coreServices?.length || 0) > 4 && (
                          <span className="px-2 py-1 text-[10px] font-bold text-white/40 bg-white/5 rounded-lg border border-white/10">
                            +{(project.coreServices?.length || 0) - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {project.deployUrl && (
                          <a
                            href={project.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 glass hover:bg-white/20 rounded-xl text-white/70 hover:text-white transition-all"
                            title="Live Deploy Link"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 glass hover:bg-white/20 rounded-xl text-white/70 hover:text-white transition-all"
                            title="GitHub Source"
                          >
                            <Github size={16} />
                          </a>
                        )}
                      </div>

                      <Link
                        to={`/my-projects/${project.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 group/link"
                      >
                        <span>View Details</span>
                        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
