import { motion } from "motion/react";
import { Briefcase, GraduationCap } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const experiences = [
  {
    title: "Senior Full Stack Developer",
    company: "Tech Innovators Inc.",
    date: "2023 – Present",
    description:
      "Leading engineering teams to build scalable enterprise applications. Architecting resilient platforms using React, TypeScript, Node.js, and cloud infrastructure.",
    icon: Briefcase,
  },
  {
    title: "Frontend Developer",
    company: "Creative Digital Agency",
    date: "2021 – 2023",
    description:
      "Developed responsive, accessible user interfaces for client products. Improved core web vitals, animation fluidity, and design system consistency.",
    icon: Briefcase,
  },
  {
    title: "Junior Web Developer",
    company: "StartUp Vision",
    date: "2019 – 2021",
    description:
      "Contributed to production web applications, resolved complex state bugs, and collaborated with product designers on reusable UI components.",
    icon: Briefcase,
  },
  {
    title: "B.Sc. in Computer Science",
    company: "University of Technology",
    date: "2015 – 2019",
    description:
      "Graduated with honors. Specialized in software engineering, distributed databases, and modern web architecture.",
    icon: GraduationCap,
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-24 bg-white border-b border-zinc-200">
      <div className="container px-6 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease }}
          className="mb-14"
        >
          <p className="text-xs font-semibold text-blue-600 tracking-wide mb-2">
            04. Experience
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-zinc-950">
            Career Journey
          </h2>
        </motion.div>

        <div className="border-t border-zinc-200 divide-y divide-zinc-200">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.06, ease }}
              className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start"
            >
              <div className="md:col-span-3 flex items-center gap-2.5 text-sm font-mono tabular-nums text-zinc-500">
                <exp.icon size={15} className="text-zinc-400 shrink-0" />
                <span>{exp.date}</span>
              </div>

              <div className="md:col-span-4">
                <h3 className="text-lg font-display font-bold text-zinc-950">
                  {exp.title}
                </h3>
                <p className="text-sm font-medium text-blue-600 mt-0.5">
                  {exp.company}
                </p>
              </div>

              <div className="md:col-span-5">
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
