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
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col">
      <Helmet>
        <title>404: Page Not Found | Shakibul Islam Prohor</title>
        <meta
          name="description"
          content="The page you requested does not exist or has been moved. Return to the homepage of Shakibul Islam Prohor."
        />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content="404: Page Not Found | Shakibul Islam Prohor" />
        <meta
          property="og:description"
          content="The page you requested could not be found on Shakibul Islam Prohor's portfolio."
        />
        <meta property="og:image" content="https://shakibul-islam-portofolio.vercel.app/og-image-v2.png" />
      </Helmet>

      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-28 md:py-36 bg-white">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            <p className="text-xs font-semibold text-blue-600 mb-3">
              Error 404
            </p>
            <h1 className="text-7xl sm:text-8xl font-extrabold font-display tracking-tight text-zinc-950 tabular-nums mb-4">
              404
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-950 mb-3">
              Page Not Found
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 max-w-md mx-auto leading-relaxed mb-8">
              The page you are looking for might have been moved, renamed, or is temporarily unavailable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
          >
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-950 hover:bg-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Home size={16} />
              Return Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16, ease }}
            className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 max-w-lg mx-auto text-left"
          >
            <p className="text-xs font-semibold text-zinc-500 mb-4">
              Popular Destinations
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/my-projects"
                className="flex items-center gap-3 p-3 rounded-xl bg-white hover:border-zinc-300 border border-zinc-200 transition-colors"
              >
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
                  <FolderGit2 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-950 truncate">Projects</p>
                  <p className="text-[11px] text-zinc-500 truncate">Web &amp; Software</p>
                </div>
              </Link>

              <Link
                to="/about"
                className="flex items-center gap-3 p-3 rounded-xl bg-white hover:border-zinc-300 border border-zinc-200 transition-colors"
              >
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
                  <Compass size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-950 truncate">About Prohor</p>
                  <p className="text-[11px] text-zinc-500 truncate">Bio &amp; Tech Stack</p>
                </div>
              </Link>

              <Link
                to="/blog"
                className="flex items-center gap-3 p-3 rounded-xl bg-white hover:border-zinc-300 border border-zinc-200 transition-colors"
              >
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-950 truncate">Articles</p>
                  <p className="text-[11px] text-zinc-500 truncate">Tutorials &amp; Guides</p>
                </div>
              </Link>

              <Link
                to="/contact"
                className="flex items-center gap-3 p-3 rounded-xl bg-white hover:border-zinc-300 border border-zinc-200 transition-colors"
              >
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
                  <Send size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-950 truncate">Contact</p>
                  <p className="text-[11px] text-zinc-500 truncate">Hire / Collaboration</p>
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
