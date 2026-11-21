import { motion } from "motion/react";
import { Code2, Database, Layout, Smartphone } from "lucide-react";
import SafeImage from "./common/SafeImage";

const ease = [0.16, 1, 0.3, 1] as const;

const pillars = [
  { icon: Layout, title: "Frontend Architecture", desc: "React, Next.js, TypeScript" },
  { icon: Database, title: "Backend & Cloud", desc: "Node.js, Express, Firebase" },
  { icon: Smartphone, title: "Responsive Systems", desc: "Mobile-First Interfaces" },
  { icon: Code2, title: "Maintainable Code", desc: "Clean Patterns & SEO" },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-zinc-50/60 border-b border-zinc-200">
      <div className="container px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease }}
          className="max-w-2xl mb-14"
        >
          <p className="text-xs font-semibold text-blue-600 tracking-wide mb-2">
            01. About
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-zinc-950 [text-wrap:balance]">
            Bridging visual precision with{" "}
            <span className="font-serif italic font-semibold text-zinc-700">
              full-stack engineering.
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease }}
            className="lg:col-span-5"
          >
            <div className="h-[340px] sm:h-[400px] lg:h-full rounded-2xl overflow-hidden border border-zinc-200 bg-white p-2">
              <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-100">
                <SafeImage
                  src="/prohor-v2.png"
                  alt="Shakibul Islam Prohor"
                  className="w-full h-full object-cover"
                  fallbackTitle="Shakibul Islam Prohor"
                />
              </div>
            </div>
          </motion.div>

          {/* Editorial Bio + Clean Hairline Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.08, ease }}
            className="lg:col-span-7 flex flex-col justify-between bg-white border border-zinc-200 rounded-2xl p-8 md:p-10"
          >
            <div>
              <h3 className="text-2xl font-display font-bold text-zinc-950 mb-4">
                Passionate Developer Crafting Digital Experiences
              </h3>
              <p className="text-zinc-600 mb-5 leading-relaxed text-base">
                Hello! I&apos;m Shakibul Islam Prohor, a Full Stack Developer focused on creating fast, accessible, and resilient web applications. I work across the full lifecycle—from clean interface design systems to real-time database architecture and API security.
              </p>
              <p className="text-zinc-600 mb-8 leading-relaxed text-base">
                With deep expertise in modern JavaScript ecosystems and scalable cloud backends, I enjoy turning complex product requirements into straightforward, dependable software.
              </p>
            </div>

            {/* Clean Hairline Grid (No nested cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-zinc-200 pt-6 gap-6">
              {pillars.map((item, index) => (
                <div key={index} className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-900 shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-950">{item.title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
