import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

const skills = [
  {
    category: "Frontend Engineering",
    items: [
      { name: "HTML5 & Semantic Web", level: 95 },
      { name: "CSS3 / Tailwind CSS", level: 92 },
      { name: "TypeScript & ES6+", level: 88 },
      { name: "React.js & Next.js", level: 90 },
    ],
  },
  {
    category: "Backend & Cloud",
    items: [
      { name: "Node.js", level: 84 },
      { name: "Express.js", level: 80 },
      { name: "Firebase Realtime & Auth", level: 88 },
      { name: "MongoDB & REST APIs", level: 78 },
    ],
  },
  {
    category: "Tooling & Craft",
    items: [
      { name: "Git & GitHub", level: 92 },
      { name: "Vite & Modern Tooling", level: 90 },
      { name: "Figma & UI Systems", level: 78 },
      { name: "Technical SEO & Performance", level: 85 },
    ],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 bg-white border-b border-zinc-200">
      <div className="container px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4"
        >
          <div>
            <p className="text-xs font-semibold text-blue-600 tracking-wide mb-2">
              02. Capabilities
            </p>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-zinc-950">
              Technical Stack
            </h2>
          </div>
          <p className="text-sm text-zinc-500 max-w-md">
            Production technologies I rely on daily to build fast, reliable full-stack applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skillGroup, groupIndex) => (
            <motion.div
              key={groupIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: groupIndex * 0.08, ease }}
              className="bg-white border border-zinc-200 rounded-2xl p-8"
            >
              <h3 className="text-lg font-display font-bold text-zinc-950 pb-4 mb-6 border-b border-zinc-200">
                {skillGroup.category}
              </h3>

              <div className="space-y-5">
                {skillGroup.items.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-sm font-medium text-zinc-800">{skill.name}</span>
                      <span className="text-xs font-mono tabular-nums text-zinc-500">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: skill.level / 100 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.75, delay: 0.1 + index * 0.06, ease }}
                        className="h-full w-full origin-left bg-zinc-950 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
