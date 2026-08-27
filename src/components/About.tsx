import { motion } from "motion/react";
import { Code2, Database, Layout, Smartphone } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-24 relative">
      <div className="container px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">About <span className="text-gradient">Me</span></h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden glass-card p-2 relative z-10">
              <img
                src="/prohor.png"
                alt="Prohor"
                className="w-full h-full object-cover rounded-2xl transition-all duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/30 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-500/30 rounded-full blur-xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-display font-semibold mb-4">
              Passionate Developer Crafting Digital Experiences
            </h3>
            <p className="text-white/70 mb-6 leading-relaxed">
              Hello! I'm Shakibul Islam Prohor, a passionate Full Stack Developer with a knack for creating elegant, efficient, and user-friendly web applications. I bridge the gap between design and engineering, ensuring that the final product is not only visually appealing but also highly functional and performant.
            </p>
            <p className="text-white/70 mb-8 leading-relaxed">
              With expertise in modern JavaScript frameworks and robust backend technologies, I enjoy tackling complex problems and turning them into simple, beautiful interface designs.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Layout, title: "Frontend", desc: "React, Next.js" },
                { icon: Database, title: "Backend", desc: "Node.js, Firebase" },
                { icon: Smartphone, title: "Responsive", desc: "Mobile First" },
                { icon: Code2, title: "Clean Code", desc: "Best Practices" },
              ].map((item, index) => (
                <div key={index} className="glass p-4 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-white/50">{item.desc}</p>
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
