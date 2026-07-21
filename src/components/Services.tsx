import { motion } from "motion/react";
import { Code, Globe, Layout, Search, Server, Smartphone } from "lucide-react";

const services = [
  {
    title: "Web Development",
    description: "Building fast, responsive, and scalable web applications using modern technologies like React and Node.js.",
    icon: Globe,
  },
  {
    title: "UI/UX Design",
    description: "Creating intuitive and visually appealing user interfaces that provide exceptional user experiences.",
    icon: Layout,
  },
  {
    title: "Backend Development",
    description: "Designing robust APIs and database architectures to power your applications securely.",
    icon: Server,
  },
  {
    title: "Mobile Optimization",
    description: "Ensuring your websites look and function perfectly across all devices and screen sizes.",
    icon: Smartphone,
  },
  {
    title: "SEO Optimization",
    description: "Improving your website's visibility on search engines to drive more organic traffic.",
    icon: Search,
  },
  {
    title: "Clean Code",
    description: "Writing maintainable, well-documented, and efficient code following industry best practices.",
    icon: Code,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 relative">
      <div className="container px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">My <span className="text-gradient">Services</span></h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="text-cyan-400 w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-white">
                {service.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
