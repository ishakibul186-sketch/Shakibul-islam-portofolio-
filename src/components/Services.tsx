import { motion } from "motion/react";
import { Code, Globe, Layout, Search, Server, Smartphone } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const services = [
  {
    num: "01",
    title: "Web Development",
    description:
      "Fast, responsive, and scalable full-stack web applications engineered with React, TypeScript, and Node.js.",
    icon: Globe,
  },
  {
    num: "02",
    title: "UI/UX Engineering",
    description:
      "Crisp, intuitive user interfaces and component systems designed for clarity, accessibility, and effortless interaction.",
    icon: Layout,
  },
  {
    num: "03",
    title: "Backend & APIs",
    description:
      "Resilient RESTful APIs, real-time Firebase listeners, authentication flows, and clean database schemas.",
    icon: Server,
  },
  {
    num: "04",
    title: "Responsive Optimization",
    description:
      "Precision layouts and touch ergonomics tuned across desktop monitors, tablets, and mobile viewports.",
    icon: Smartphone,
  },
  {
    num: "05",
    title: "Technical SEO",
    description:
      "Structured JSON-LD schema markup, semantic HTML, and Core Web Vitals optimization for organic discoverability.",
    icon: Search,
  },
  {
    num: "06",
    title: "Clean Architecture",
    description:
      "Maintainable, strongly-typed codebases documented and structured for long-term team velocity.",
    icon: Code,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white border-b border-zinc-200">
      <div className="container px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease }}
          className="mb-14"
        >
          <p className="text-xs font-semibold text-blue-600 tracking-wide mb-2">
            06. Services
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-zinc-950">
            How I Help Teams Ship
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-zinc-200 rounded-2xl overflow-hidden">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: index * 0.05, ease }}
              className="p-8 bg-white border-r border-b border-zinc-200 hover:bg-zinc-50/80 transition-colors duration-200 group"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-mono tabular-nums text-zinc-400">
                  {service.num}.
                </span>
                <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-800 group-hover:bg-zinc-950 group-hover:text-white transition-colors duration-200">
                  <service.icon size={18} />
                </div>
              </div>

              <h3 className="text-lg font-display font-bold mb-2.5 text-zinc-950">
                {service.title}
              </h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
