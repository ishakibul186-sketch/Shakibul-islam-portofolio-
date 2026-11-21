import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { Project } from "../types/project";
import { getCachedProjects } from "../lib/projectUtils";
import { DEFAULT_PROJECTS } from "../data/defaultProjects";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SafeImage from "../components/common/SafeImage";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FolderGit2,
  Layers,
  X,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(() => {
    if (!id) return null;
    const cached = getCachedProjects();
    const foundCached = cached.find((p) => p.id === id || String(p.numericId) === id);
    if (foundCached) return foundCached;
    return DEFAULT_PROJECTS.find((p) => p.id === id || String(p.numericId) === id) || null;
  });

  const [loading, setLoading] = useState(!project);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
    if (!id) return;
    const projectRef = ref(db, `projects/${id}`);

    const unsubscribe = onValue(
      projectRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          setProject({
            ...val,
            id: id,
            features: val.features || [],
            coreServices: val.coreServices || [],
            images: val.images || [],
          });
        } else {
          const defaultFound = DEFAULT_PROJECTS.find(
            (p) => p.id === id || String(p.numericId) === id
          );
          if (defaultFound) {
            setProject(defaultFound);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching project:", error);
        const defaultFound = DEFAULT_PROJECTS.find(
          (p) => p.id === id || String(p.numericId) === id
        );
        if (defaultFound) {
          setProject(defaultFound);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const allImages = project
    ? [project.thumbnail, ...(project.images || [])].filter(Boolean)
    : [];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !project) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 flex flex-col">
        <Helmet>
          <title>Loading Project... | Shakibul Islam Prohor</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-2 border-zinc-200 border-t-zinc-950 rounded-full animate-spin mx-auto" />
            <p className="text-zinc-500 text-sm">Loading project details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-zinc-50 max-w-md w-full p-8 text-center rounded-2xl border border-zinc-200">
            <FolderGit2 size={40} className="text-zinc-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display text-zinc-950">Project Not Found</h2>
            <p className="text-zinc-600 text-sm mt-2">
              The project you are looking for might have been moved or removed.
            </p>
            <Link
              to="/my-projects"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 hover:bg-blue-600 rounded-xl font-semibold text-xs text-white transition-colors"
            >
              <ArrowLeft size={15} /> Back to Projects
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const projectKeywords =
    typeof project.metaKeywords === "string" && project.metaKeywords.trim()
      ? project.metaKeywords.trim()
      : Array.isArray((project as any).keywords) && (project as any).keywords.length > 0
      ? (project as any).keywords.join(", ")
      : `${project.title}, ${project.category || "Software Project"}, ${
          Array.isArray(project.coreServices) ? project.coreServices.join(", ") : ""
        }`;

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col">
      <Helmet>
        <title>{project.metaTitle || `${project.title} | Shakibul Islam Prohor Projects`}</title>
        <meta name="title" content={project.metaTitle || `${project.title} | Shakibul Islam Prohor Projects`} />
        <meta name="description" content={project.metaDescription || project.description || "Project details and architecture specification."} />
        <meta name="keywords" content={projectKeywords} />
        <link rel="canonical" href={project.metaCanonicalUrl || `https://shakibul-islam-portofolio.vercel.app/my-projects/${project.id}`} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Shakibul Islam Prohor Portfolio" />
        <meta property="og:url" content={project.metaCanonicalUrl || `https://shakibul-islam-portofolio.vercel.app/my-projects/${project.id}`} />
        <meta property="og:title" content={project.metaTitle || `${project.title} – Software Engineering Project`} />
        <meta property="og:description" content={project.metaDescription || project.description} />
        <meta property="og:image" content={project.metaOgImage || project.thumbnail || "https://shakibul-islam-portofolio.vercel.app/prohor-v2.png"} />
        <meta property="og:image:alt" content={`${project.title} Screenshot Preview`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={project.metaTitle || `${project.title} | Shakibul Islam Prohor`} />
        <meta name="twitter:description" content={project.metaDescription || project.description} />
        <meta name="twitter:image" content={project.metaOgImage || project.thumbnail || "https://shakibul-islam-portofolio.vercel.app/prohor-v2.png"} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: project.title,
            description: project.metaDescription || project.description,
            url: project.metaCanonicalUrl || `https://shakibul-islam-portofolio.vercel.app/my-projects/${project.id}`,
            image: project.metaOgImage || project.thumbnail || "https://shakibul-islam-portofolio.vercel.app/prohor-v2.png",
            applicationCategory: project.metaCategory || project.category || "DeveloperApplication",
            operatingSystem: "Web",
            author: {
              "@type": "Person",
              name: "Shakibul Islam Prohor",
              url: "https://shakibul-islam-portofolio.vercel.app/",
            },
          })}
        </script>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-28 md:pt-32 pb-24 bg-white">
        <div className="container px-6 mx-auto max-w-6xl">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-200">
            <Link
              to="/my-projects"
              className="inline-flex items-center text-zinc-600 hover:text-zinc-950 transition-colors group text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform duration-150" />
              All Projects
            </Link>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 transition-colors cursor-pointer"
            >
              <Share2 size={14} />
              <span>Share Project</span>
            </button>
          </div>

          {/* Project Title Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
            className="space-y-3 mb-10"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-medium">
              <span className="text-zinc-900 font-semibold">{project.category || "Full Stack"}</span>
              {project.status && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">{project.status}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-zinc-950 [text-wrap:balance]">
              {project.title}
            </h1>
          </motion.div>

          {/* Image Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200 mb-12 p-3 sm:p-4"
          >
            {allImages.length > 0 ? (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                  <SafeImage
                    src={allImages[activeImageIndex]}
                    alt={`${project.title} - Screenshot ${activeImageIndex + 1}`}
                    fallbackTitle={project.title}
                    className="w-full h-full object-cover"
                  />

                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        aria-label="Previous screenshot"
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-white/90 hover:bg-white text-zinc-950 border border-zinc-200 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={handleNextImage}
                        aria-label="Next screenshot"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-white/90 hover:bg-white text-zinc-950 border border-zinc-200 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-mono tabular-nums font-semibold text-zinc-900 border border-zinc-200">
                    {activeImageIndex + 1} / {allImages.length}
                  </div>
                </div>

                {allImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-24 sm:w-32 aspect-video rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? "border-blue-600 opacity-100"
                            : "border-zinc-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <SafeImage
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fallbackTitle={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-zinc-400 text-sm">
                No images available for this project.
              </div>
            )}
          </motion.div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-4">
                <h2 className="text-xl font-bold font-display text-zinc-950">
                  Project Overview
                </h2>
                <p className="text-zinc-600 text-base leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {project.features && project.features.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-5">
                  <h2 className="text-xl font-bold font-display text-zinc-950">
                    Key Features &amp; Architecture
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {project.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-sm text-zinc-700"
                      >
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-3">
                <h3 className="text-xs font-semibold text-zinc-500 mb-2">
                  Project Links
                </h3>

                {project.deployUrl && (
                  <a
                    href={project.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-zinc-950 hover:bg-blue-600 rounded-xl font-semibold text-xs text-white transition-colors"
                  >
                    <ExternalLink size={15} />
                    <span>Open Live Demo</span>
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl font-semibold text-xs text-zinc-900 transition-colors"
                  >
                    <Github size={15} />
                    <span>View GitHub Repository</span>
                  </a>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
                <h3 className="text-xs font-semibold text-zinc-500 flex items-center gap-2">
                  <Layers size={14} className="text-blue-600" />
                  <span>Core Services &amp; Tech Stack</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.coreServices?.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-medium rounded-lg"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease }}
              className="bg-white max-w-lg w-full rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <Share2 size={18} className="text-blue-600" />
                  <h3 className="font-bold text-lg font-display text-zinc-950">Share Project</h3>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-500">
                  Link Preview
                </span>
                <div className="bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200">
                  {project.thumbnail && (
                    <div className="aspect-video w-full overflow-hidden bg-zinc-100 border-b border-zinc-200">
                      <SafeImage
                        src={project.thumbnail}
                        alt={project.title}
                        fallbackTitle={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-1">
                    <p className="font-bold text-sm text-zinc-950 line-clamp-1">{project.title}</p>
                    <p className="text-xs text-zinc-600 line-clamp-2">{project.description}</p>
                    <p className="text-[11px] text-blue-600 font-mono pt-1">
                      {window.location.hostname}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-500">
                  Share Link
                </span>
                <div className="flex items-center gap-2 p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-transparent text-xs text-zinc-700 px-2 focus:outline-none font-mono truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-zinc-950 hover:bg-blue-600 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy URL"}
                  </button>
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
