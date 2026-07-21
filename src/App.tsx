import { useState } from "react";
import { AnimatePresence } from "motion/react";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Blog from "./components/Blog";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30">
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loading" onComplete={() => setLoading(false)} />
        ) : (
          <div key="content" className="relative">
            {/* Global Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            </div>
            
            <div className="relative z-10">
              <Navbar />
              <main>
                <Hero />
                <About />
                <Skills />
                <Projects />
                <Experience />
                <Blog />
                <Services />
                <Contact />
              </main>
              <Footer />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

