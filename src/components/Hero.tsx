import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Facebook, Github, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import SafeImage from "./common/SafeImage";

const ease = [0.16, 1, 0.3, 1] as const;

const marqueeItems = [
  "Full-Stack Architecture",
  "React & TypeScript Systems",
  "Node.js & Cloud Backends",
  "Real-Time Web Applications",
  "Technical Writing",
  "Selected Works",
];

const metrics = [
  { value: "4+", label: "Years Experience" },
  { value: "25+", label: "Shipped Web Systems" },
  { value: "React / Node", label: "Core Architecture" },
  { value: "Dhaka, BD", label: "Worldwide Remote" },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative bg-white min-h-[calc(100svh)] flex flex-col justify-between pt-20 md:pt-24 overflow-hidden"
    >
      <div className="container px-4 sm:px-6 mx-auto max-w-6xl flex-1 flex flex-col justify-center py-4 md:py-6">
        {/* Split-Screen Editorial Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
                className="text-xs sm:text-sm font-medium text-zinc-500 mb-3 sm:mb-4 flex flex-wrap items-center gap-2"
              >
                <span>Shakibul Islam Prohor</span>
                <span aria-hidden="true">·</span>
                <span>Full Stack Software Engineer</span>
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.06, ease }}
                className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold font-display tracking-tight text-zinc-950 leading-[1.1] mb-4 [text-wrap:balance]"
              >
                Engineering{" "}
                <span className="font-serif italic font-semibold text-blue-600">
                  resilient
                </span>{" "}
                web systems &amp; refined digital products.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12, ease }}
                className="max-w-xl text-sm sm:text-base text-zinc-600 leading-relaxed mb-6"
              >
                I design and build high-performance full-stack applications with React, TypeScript, Node.js, and real-time cloud architecture—combining editorial clarity with production engineering rigor.
              </motion.p>

              {/* Focal Primary CTA + Quiet Secondary Link */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18, ease }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  to="/my-projects"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white bg-zinc-950 hover:bg-blue-600 rounded-xl transition-colors duration-200 whitespace-nowrap shrink-0"
                >
                  <span>Explore Projects</span>
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </Link>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Start a conversation</span>
                  <ArrowUpRight size={14} />
                </a>
              </motion.div>
            </div>

            {/* Social Links Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.26, ease }}
              className="mt-6 pt-5 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3"
            >
              <span className="text-xs font-medium text-zinc-500">
                Available for engineering roles &amp; select advisory
              </span>

              <div className="flex items-center gap-2">
                {[
                  { icon: Github, href: "https://github.com/ishakibul186-sketch", label: "GitHub" },
                  { icon: Facebook, href: "https://www.facebook.com/prohor245", label: "Facebook" },
                  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
                  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 flex items-center justify-center text-zinc-600 hover:text-zinc-950 transition-colors duration-150"
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Full Uncropped 3:4 Portrait Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="aspect-[3/4] w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[335px] xl:max-w-[365px] rounded-2xl overflow-hidden border border-zinc-200 bg-white relative group">
              <SafeImage
                src="/prohor-v2.png"
                alt="Shakibul Islam Prohor — Full Stack Developer"
                className="w-full h-full object-contain bg-white group-hover:scale-[1.02] transition-transform duration-500"
                fallbackTitle="Shakibul Islam Prohor"
              />
            </div>
          </motion.div>
        </div>

        {/* Full-Width 4-Column Metric Strip Below Split */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28, ease }}
          className="mt-6 lg:mt-8 grid grid-cols-2 lg:grid-cols-4 border border-zinc-200 rounded-2xl bg-zinc-50/70 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200"
        >
          {metrics.map((metric, idx) => (
            <div key={idx} className="px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col justify-between">
              <span className="text-lg sm:text-xl md:text-2xl font-bold font-display tracking-tight text-zinc-950 tabular-nums">
                {metric.value}
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-zinc-500 mt-0.5">
                {metric.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Subtle Editorial Marquee Divider */}
      <div className="border-y border-zinc-200 bg-zinc-50/50 py-2.5 overflow-hidden select-none">
        <div className="animate-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-[11px] sm:text-xs font-medium text-zinc-500 tracking-wide px-5 whitespace-nowrap"
            >
              <span>{item}</span>
              <span className="ml-10 text-zinc-300" aria-hidden="true">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
