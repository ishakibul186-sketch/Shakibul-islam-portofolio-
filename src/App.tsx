import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./context/AuthContext";
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
import ArticleDetails from "./pages/ArticleDetails";
import MyProjects from "./pages/MyProjects";
import ProjectDetails from "./pages/ProjectDetails";
import AdminLayout from "./pages/admin/AdminLayout";
import ProjectsAdmin from "./admin/pages/ProjectsAdmin";
import Dashboard from "./admin/pages/Dashboard";
import AddArticle from "./admin/pages/AddArticle";

interface HomePageProps {
  initialSection?: string;
  meta?: {
    title: string;
    description: string;
    canonical: string;
  };
}

function HomePage({ initialSection, meta }: HomePageProps) {
  const location = useLocation();

  useEffect(() => {
    const targetId = initialSection || (location.hash ? location.hash.replace("#", "") : null);
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    } else if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [initialSection, location.pathname, location.hash]);

  const title = meta?.title || "Shakibul Islam Prohor | Full Stack Developer & Software Engineer";
  const description = meta?.description || "Official portfolio of Shakibul Islam Prohor – Full Stack Developer & Software Engineer specializing in modern React, TypeScript, Node.js, Firebase, cloud architecture, and high-performance web applications.";
  const canonical = meta?.canonical || "https://shakibul-islam-portofolio.vercel.app/";

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://shakibul-islam-portofolio.vercel.app/prohor.png" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://shakibul-islam-portofolio.vercel.app/prohor.png" />
      </Helmet>
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
    </>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? <>{children}</> : <Navigate to="/" />;
}

function MainApp() {
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
              <Routes>
                {/* Public Clean Routes & SEO Pages */}
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/about"
                  element={
                    <HomePage
                      initialSection="about"
                      meta={{
                        title: "About Shakibul Islam Prohor | Full Stack Developer & Software Engineer",
                        description: "Learn more about Shakibul Islam Prohor – Full Stack Developer and Software Engineer specializing in modern React, TypeScript, Node.js, and cloud systems.",
                        canonical: "https://shakibul-islam-portofolio.vercel.app/about",
                      }}
                    />
                  }
                />
                <Route
                  path="/skills"
                  element={
                    <HomePage
                      initialSection="skills"
                      meta={{
                        title: "Technical Skills & Tech Stack | Shakibul Islam Prohor",
                        description: "Explore the technical capabilities, programming languages, libraries, and frameworks utilized by Shakibul Islam Prohor.",
                        canonical: "https://shakibul-islam-portofolio.vercel.app/skills",
                      }}
                    />
                  }
                />
                <Route
                  path="/blog"
                  element={
                    <HomePage
                      initialSection="blog"
                      meta={{
                        title: "Technical Blog & Articles | Shakibul Islam Prohor",
                        description: "Read insightful web development tutorials, React best practices, full stack architecture guides, and tech articles by Shakibul Islam Prohor.",
                        canonical: "https://shakibul-islam-portofolio.vercel.app/blog",
                      }}
                    />
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <HomePage
                      initialSection="contact"
                      meta={{
                        title: "Contact & Hire Shakibul Islam Prohor | Full Stack Developer",
                        description: "Get in touch with Shakibul Islam Prohor for web development projects, software engineering consultations, freelance inquiries, and full stack development collaborations.",
                        canonical: "https://shakibul-islam-portofolio.vercel.app/contact",
                      }}
                    />
                  }
                />
                
                {/* Projects & Articles routes */}
                <Route path="/my-projects" element={<MyProjects />} />
                <Route path="/my-projects/:id" element={<ProjectDetails />} />
                <Route path="/articles/:id" element={<ArticleDetails />} />
                
                {/* Admin Panel Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<ProjectsAdmin />} />
                  <Route path="projects" element={<ProjectsAdmin />} />
                  <Route path="articles" element={<Dashboard />} />
                  <Route path="articles/add" element={<AddArticle />} />
                  <Route path="articles/edit/:id" element={<AddArticle />} />
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}
