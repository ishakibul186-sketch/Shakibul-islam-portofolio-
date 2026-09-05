import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ref, get, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { Project } from "../types/project";
import { getCachedProjects } from "../lib/projectUtils";
import { DEFAULT_PROJECTS } from "../data/defaultProjects";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
  Sparkles, 
  Calendar,
  X,
  Maximize2
} from "lucide-react";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Try to find cached project immediately for instant render
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

  // Fetch real-time data
  useEffect(() => {
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
          // If not in Firebase directly by key, check DEFAULT_PROJECTS
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

  // Consolidate all images (Thumbnail + additional screenshot gallery)
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
      <div className="min-h-screen bg-[#030014] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-white/40 text-sm">Loading project details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="glass-card max-w-md w-full p-8 text-center rounded-3xl border border-white/10">
            <FolderGit2 size={48} className="text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display">Project Not Found</h2>
            <p className="text-white/50 text-sm mt-2">
              The project you are looking for might have been moved or removed.
            </p>
            <Link
              to="/my-projects"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-xs text-white"
            >
              <ArrowLeft size={16} /> Back to Projects
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white flex flex-col selection:bg-purple-500/30">
      {/* SEO & Open Graph Meta Tags */}
      <Helmet>
        <title>{project.metaTitle || `${project.title} | Shakibul Islam Prohor Projects`}</title>
        <meta name="title" content={project.metaTitle || `${project.title} | Shakibul Islam Prohor Projects`} />
        <meta name="description" content={project.metaDescription || project.description || "Project details and architecture specification."} />
        {project.metaKeywords && <meta name="keywords" content={project.metaKeywords} />}
        <link rel="canonical" href={project.metaCanonicalUrl || `https://shakibul-islam-portofolio.vercel.app/my-projects/${project.id}`} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Shakibul Islam Prohor Portfolio" />
        <meta property="og:url" content={project.metaCanonicalUrl || `https://shakibul-islam-portofolio.vercel.app/my-projects/${project.id}`} />
        <meta property="og:title" content={project.metaTitle || `${project.title} – Software Engineering Project`} />
        <meta property="og:description" content={project.metaDescription || project.description} />
        <meta property="og:image" content={project.metaOgImage || project.thumbnail || "https://shakibul-islam-portofolio.vercel.app/prohor.png"} />
        <meta property="og:image:alt" content={`${project.title} Screenshot Preview`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={project.metaTitle || `${project.title} | Shakibul Islam Prohor`} />
        <meta name="twitter:description" content={project.metaDescription || project.description} />
        <meta name="twitter:image" content={project.metaOgImage || project.thumbnail || "https://shakibul-islam-portofolio.vercel.app/prohor.png"} />

        {/* Schema.org SoftwareApplication */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": project.title,
            "description": project.metaDescription || project.description,
            "url": project.metaCanonicalUrl || `https://shakibul-islam-portofolio.vercel.app/my-projects/${project.id}`,
            "image": project.metaOgImage || project.thumbnail || "https://shakibul-islam-portofolio.vercel.app/prohor.png",
            "applicationCategory": project.metaCategory || project.category || "DeveloperApplication",
            "operatingSystem": "Web",
            "author": {
              "@type": "Person",
              "name": "Shakibul Islam Prohor",
              "url": "https://shakibul-islam-portofolio.vercel.app/"
            }
          })}
        </script>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[300px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="container px-6 mx-auto max-w-6xl relative z-10">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/my-projects"
              className="inline-flex items-center text-white/60 hover:text-white transition-colors group text-sm font-semibold"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              All Projects
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-xl text-xs font-semibold text-white/80 hover:text-white transition-all"
              >
                <Share2 size={14} />
                <span>Share Project</span>
              </button>
            </div>
          </div>

          {/* Project Title Header */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                {project.category || "Full Stack"}
              </span>

              {project.status && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {project.status}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
              {project.title}
            </h1>
          </div>

          {/* Image Carousel / Discover Gallery */}
          <div className="glass-card rounded-3xl overflow-hidden border border-white/10 mb-12 p-3 sm:p-4 bg-black/40">
            {allImages.length > 0 ? (
              <div className="space-y-4">
                {/* Main Carousel Viewer */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/5 group">
                  <img
                    src={allImages[activeImageIndex]}
                    alt={`${project.title} - Screenshot ${activeImageIndex + 1}`}
                    className="w-full h-full object-contain md:object-cover"
                  />

                  {/* Previous / Next Controls */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        aria-label="Previous screenshot"
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/70 hover:bg-purple-600 text-white backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button
                        onClick={handleNextImage}
                        aria-label="Next screenshot"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/70 hover:bg-purple-600 text-white backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}

                  {/* Counter Badge */}
                  <div className="absolute bottom-4 right-4 px-3.5 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-xs font-mono font-bold text-white border border-white/10">
                    {activeImageIndex + 1} / {allImages.length}
                  </div>
                </div>

                {/* Thumbnails Strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-24 sm:w-32 aspect-video rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx
                            ? "border-purple-500 ring-2 ring-purple-500/30 scale-105"
                            : "border-white/10 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-white/30">
                No images available for this project.
              </div>
            )}
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Description and Features */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-400" />
                  Project Overview
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {/* Key Features */}
              {project.features && project.features.length > 0 && (
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                  <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    Key Features & Architecture
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {project.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/5 text-xs sm:text-sm text-white/80"
                      >
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Col: Tech Stack & Action Links */}
            <div className="space-y-6">
              {/* Action Buttons Box */}
              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Project Links
                </h3>

                {project.deployUrl && (
                  <a
                    href={project.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-2xl font-bold text-xs text-white shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ExternalLink size={16} />
                    <span>Open Live Demo</span>
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-xs text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Github size={16} />
                    <span>View GitHub Repository</span>
                  </a>
                )}
              </div>

              {/* Core Services / Tech Stack */}
              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
                  <Layers size={14} className="text-purple-400" />
                  Core Services & Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.coreServices?.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold rounded-xl"
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

      {/* Share Modal with SEO / Open Graph preview */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0c091d] max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-cyan-400" />
                <h3 className="font-bold text-lg font-display">Share Project</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-white/40 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Open Graph Card Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                Open Graph Card Preview
              </span>
              <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                {project.thumbnail && (
                  <div className="aspect-video w-full overflow-hidden bg-black/40">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 space-y-1">
                  <p className="font-bold text-sm text-white line-clamp-1">{project.title}</p>
                  <p className="text-xs text-white/50 line-clamp-2">{project.description}</p>
                  <p className="text-[10px] text-cyan-400 font-mono pt-1">
                    {window.location.hostname}
                  </p>
                </div>
              </div>
            </div>

            {/* Copy Link URL */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                Share Link
              </span>
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-2xl border border-white/10">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-transparent text-xs text-white/80 px-2 focus:outline-none font-mono truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy URL"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
