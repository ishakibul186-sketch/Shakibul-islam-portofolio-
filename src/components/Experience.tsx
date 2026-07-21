import { motion } from "motion/react";
import { Briefcase, GraduationCap } from "lucide-react";

const experiences = [
  {
    title: "Senior Full Stack Developer",
    company: "Tech Innovators Inc.",
    date: "2023 - Present",
    description: "Leading a team of developers to build scalable enterprise applications. Architecting solutions using React, Node.js, and AWS.",
    icon: Briefcase,
  },
  {
    title: "Frontend Developer",
    company: "Creative Digital Agency",
    date: "2021 - 2023",
    description: "Developed responsive and interactive user interfaces for various client projects. Improved site performance and accessibility.",
    icon: Briefcase,
  },
  {
    title: "Junior Web Developer",
    company: "StartUp Vision",
    date: "2019 - 2021",
    description: "Assisted in the development of web applications, fixed bugs, and collaborated with designers to implement UI components.",
    icon: Briefcase,
  },
  {
    title: "B.Sc. in Computer Science",
    company: "University of Technology",
    date: "2015 - 2019",
    description: "Graduated with honors. Specialized in software engineering and web technologies.",
    icon: GraduationCap,
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-24 relative bg-white/[0.02]">
      <div className="container px-6 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">My <span className="text-gradient">Journey</span></h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full" />
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-cyan-500/50 to-transparent" />

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-start ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 mt-1.5 w-10 h-10 rounded-full glass flex items-center justify-center z-10 border-purple-500/30 text-cyan-400">
                  <exp.icon size={18} />
                </div>

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pl-12" : "md:pr-12 text-left md:text-right"}`}>
                  <div className="glass-card p-6 hover:border-purple-500/30 transition-colors">
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-medium text-cyan-300 bg-cyan-500/10 rounded-full">
                      {exp.date}
                    </span>
                    <h3 className="text-xl font-display font-semibold mb-1 text-white">
                      {exp.title}
                    </h3>
                    <h4 className="text-sm font-medium text-purple-400 mb-4">
                      {exp.company}
                    </h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
