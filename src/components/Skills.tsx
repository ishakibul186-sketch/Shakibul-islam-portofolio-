import { motion } from "motion/react";

const skills = [
  { category: "Frontend", items: [
    { name: "HTML5", level: 95 },
    { name: "CSS3 / Tailwind", level: 90 },
    { name: "JavaScript (ES6+)", level: 85 },
    { name: "React.js", level: 88 },
  ]},
  { category: "Backend", items: [
    { name: "Node.js", level: 80 },
    { name: "Express", level: 75 },
    { name: "Firebase", level: 85 },
    { name: "MongoDB", level: 70 },
  ]},
  { category: "Tools & Others", items: [
    { name: "Git & GitHub", level: 90 },
    { name: "VS Code", level: 95 },
    { name: "Figma", level: 75 },
    { name: "SEO Optimization", level: 80 },
  ]}
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 relative bg-white/[0.02]">
      <div className="container px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">My <span className="text-gradient">Skills</span></h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skillGroup, groupIndex) => (
            <motion.div
              key={groupIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
              className="glass-card p-8"
            >
              <h3 className="text-xl font-display font-semibold mb-6 text-white/90">
                {skillGroup.category}
              </h3>
              <div className="space-y-6">
                {skillGroup.items.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-white/80">{skill.name}</span>
                      <span className="text-sm font-medium text-white/50">{skill.level}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
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
