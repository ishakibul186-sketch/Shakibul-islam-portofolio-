import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { Project } from "../types/project";
import {
  getCachedProjects,
  saveProjectsToCache,
  sortProjectsZA,
} from "../lib/projectUtils";
import { DEFAULT_PROJECTS } from "../data/defaultProjects";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SafeImage from "../components/common/SafeImage";
import {
  FolderGit2,
  ExternalLink,
  Github,
  ArrowRight,
  Search,
  ArrowLeft,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>(() => getCachedProjects());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    window.scrollTo(0, 0);
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
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col">
      <Helmet>
        <title>My Projects &amp; Software Portfolio | Shakibul Islam Prohor</title>
        <meta
          name="description"
          content="Explore full stack web applications, AI systems, and production software engineered by Shakibul Islam Prohor using React, TypeScript, Node.js, Firebase, and modern cloud technologies."
        />
        <meta
          name="keywords"
          content="Shakibul Islam Prohor Projects, Full Stack Portfolio, React Web Apps, Node.js Projects, Firebase Applications, Software Engineer Bangladesh, Prohor Projects"
        />
        <link rel="canonical" href="https://shakibul-islam-portofolio.vercel.app/my-projects" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Shakibul Islam Prohor Portfolio" />
        <meta property="og:title" content="My Projects & Software Portfolio | Shakibul Islam Prohor" />
        <meta property="og:description" content="Explore full stack web applications, AI systems, and production software engineered by Shakibul Islam Prohor." />
        <meta property="og:url" content="https://shakibul-islam-portofolio.vercel.app/my-projects" />
        <meta property="og:image" content="https://shakibul-islam-portofolio.vercel.app/og-image-v2.png" />
        <meta property="og:image:alt" content="Shakibul Islam Prohor Projects Showcase" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My Projects & Software Portfolio | Shakibul Islam Prohor" />
        <meta name="twitter:description" content="Explore full stack web applications, AI systems, and production software built by Shakibul Islam Prohor." />
        <meta name="twitter:image" content="https://shakibul-islam-portofolio.vercel.app/og-image-v2.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "My Projects | Shakibul Islam Prohor Portfolio",
            url: "https://shakibul-islam-portofolio.vercel.app/my-projects",
            description: "Showcase of web apps, full-stack projects, and software by Shakibul Islam Prohor.",
            author: {
              "@type": "Person",
              name: "Shakibul Islam Prohor",
              url: "https://shakibul-islam-portofolio.vercel.app/",
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://shakibul-islam-portofolio.vercel.app/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "My Projects",
                  item: "https://shakibul-islam-portofolio.vercel.app/my-projects",
                },
              ],
            },
          })}
        </script>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-28 md:pt-32 pb-24 bg-white">
        <div className="container px-6 mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-10 border-b border-zinc-200">
            <Link
              to="/"
              className="inline-flex items-center text-zinc-600 hover:text-zinc-950 transition-colors group text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform duration-150" />
              Back to Home
            </Link>

            <span className="text-xs font-mono tabular-nums text-zinc-500">
              {projects.length} Published Projects
            </span>
          </div>

          {/* Editorial Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
            className="max-w-3xl mb-12"
          >
            <p className="text-xs font-semibold text-blue-600 tracking-wide mb-2">
              Portfolio Archive
            </p>
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-zinc-950 mb-4">
              Selected{" "}
              <span className="font-serif italic font-semibold text-zinc-700">
                Projects
              </span>
            </h1>
            <p className="text-zinc-600 text-base md:text-lg leading-relaxed">
              A curated archive of full-stack web applications, SaaS platforms, AI systems, and production software engineered from concept to deployment.
            </p>
          </motion.div>

          {/* Search & Interactive Filter Tabs */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 md:p-5 mb-12">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="w-full lg:max-w-md relative">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search projects or tech stack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-200/60 rounded-xl">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-white text-zinc-950 shadow-xs"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {loading && projects.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-zinc-200">
                  <div className="aspect-video bg-zinc-100" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-zinc-100 rounded w-2/3" />
                    <div className="h-4 bg-zinc-100 rounded w-full" />
                    <div className="h-4 bg-zinc-100 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-2xl p-8 max-w-xl mx-auto border border-zinc-200">
              <FolderGit2 size={40} className="text-zinc-300 mx-auto mb-3" />
              <h3 className="text-xl font-bold font-display text-zinc-950">No Projects Found</h3>
              <p className="text-zinc-500 text-sm mt-2">
                {searchQuery || selectedCategory !== "All"
                  ? "Try resetting your search query or category filter."
                  : "No projects have been published yet."}
              </p>
              {(searchQuery || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-6 px-5 py-2.5 bg-zinc-950 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredProjects.map((project, index) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.25), ease }}
                  className="group bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:border-zinc-300 transition-colors flex flex-col"
                >
                  <Link
                    to={`/my-projects/${project.id}`}
                    className="relative aspect-video overflow-hidden block bg-zinc-100 border-b border-zinc-200"
                  >
                    <SafeImage
                      src={project.thumbnail}
                      alt={project.title}
                      fallbackTitle={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                        <span className="font-medium text-zinc-800">{project.category || "Full Stack"}</span>
                        {project.status && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-semibold">{project.status}</span>
                          </>
                        )}
                      </div>

                      <Link to={`/my-projects/${project.id}`}>
                        <h3 className="text-lg font-bold font-display text-zinc-950 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                      </Link>

                      <p className="text-zinc-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>

                      {project.coreServices && project.coreServices.length > 0 && (
                        <p className="text-xs font-mono text-zinc-500 mt-4 truncate">
                          {project.coreServices.slice(0, 4).join(" / ")}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-5 border-t border-zinc-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {project.deployUrl && (
                          <a
                            href={project.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
                            title="Live Deploy Link"
                            aria-label={`Live demo for ${project.title}`}
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
                            title="GitHub Source"
                            aria-label={`GitHub source for ${project.title}`}
                          >
                            <Github size={15} />
                          </a>
                        )}
                      </div>

                      <Link
                        to={`/my-projects/${project.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 hover:text-blue-600 transition-colors group/link"
                      >
                        <span>View Details</span>
                        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform duration-150" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
