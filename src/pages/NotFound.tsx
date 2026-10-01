import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Home, 
  ArrowLeft, 
  FolderGit2, 
  BookOpen, 
  Send, 
  Compass, 
  AlertCircle,
  Search
} from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030014] text-white flex flex-col selection:bg-purple-500/30 overflow-x-hidden relative">
      <Helmet>
        <title>404: Page Not Found | Shakibul Islam Prohor</title>
        <meta name="description" content="The page you requested does not exist or has been moved. Return to the homepage of Shakibul Islam Prohor." />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content="404: Page Not Found | Shakibul Islam Prohor" />
        <meta property="og:description" content="The page you requested could not be found on Shakibul Islam Prohor's portfolio." />
        <meta property="og:image" content="https://shakibul-islam-portofolio.vercel.app/prohor-v2.png" />
      </Helmet>

      <Navbar />

      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 max-w-full bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 max-w-full bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 max-w-full bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-24 sm:py-32 relative z-10">
        <div className="max-w-2xl w-full text-center">
          
          {/* Animated 404 Badge & Glitch Graphic */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="relative">
              <span className="text-8xl sm:text-9xl md:text-[11rem] font-extrabold font-display tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/10 select-none">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-purple-500/10">
                  <Compass size={14} className="animate-spin text-purple-400" style={{ animationDuration: "8s" }} />
                  Route Coordinates Lost
                </span>
              </div>
            </div>
          </motion.div>

          {/* Heading and Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight text-white mb-3">
              Oops! Page Not Found
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
              The page you are looking for might have been moved, renamed, or temporarily unavailable. Let&apos;s get you back on track.
            </p>
          </motion.div>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12"
          >
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home size={16} />
              Return Home
            </Link>
          </motion.div>

          {/* Quick Helpful Links Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md max-w-lg mx-auto text-left"
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Search size={14} className="text-purple-400" />
              Popular Destinations
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                to="/my-projects"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <FolderGit2 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white group-hover:text-purple-300 truncate">
                    Explore Projects
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">Web & Software</p>
                </div>
              </Link>

              <Link
                to="/about"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Compass size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white group-hover:text-cyan-300 truncate">
                    About Prohor
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">Bio & Tech Stack</p>
                </div>
              </Link>

              <Link
                to="/blog"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white group-hover:text-indigo-300 truncate">
                    Technical Blog
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">Tutorials & Guides</p>
                </div>
              </Link>

              <Link
                to="/contact"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Send size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white group-hover:text-emerald-300 truncate">
                    Get in Touch
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">Hire / Collaboration</p>
                </div>
              </Link>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
