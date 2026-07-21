import { motion } from "motion/react";
import { ArrowRight, Download, Github, Linkedin, Twitter } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container px-6 mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center px-3 py-1 mb-6 text-sm font-medium rounded-full glass text-cyan-400 border-cyan-400/20"
          >
            <span className="w-2 h-2 mr-2 rounded-full bg-cyan-400 animate-pulse" />
            Available for new opportunities
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold font-display tracking-tight mb-6"
          >
            Hi, I'm <span className="text-gradient">Prohor</span>
            <br />
            Full Stack Developer
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-2xl text-lg md:text-xl text-white/60 mb-10"
          >
            I build modern, scalable, and visually stunning web applications. 
            Transforming ideas into exceptional digital experiences.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <a
              href="#projects"
              className="group flex items-center px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all"
            >
              View Projects
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#contact"
              className="flex items-center px-8 py-4 text-base font-medium text-white glass rounded-full hover:bg-white/10 transition-all"
            >
              Contact Me
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex items-center gap-6"
          >
            {[
              { icon: Github, href: "https://github.com" },
              { icon: Linkedin, href: "https://linkedin.com" },
              { icon: Twitter, href: "https://twitter.com" },
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 glass rounded-full text-white/70 hover:text-white hover:scale-110 transition-all"
              >
                <social.icon size={20} />
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
