import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { Project } from "../types/project";
import { getCachedProjects, saveProjectsToCache, sortProjectsZA } from "../lib/projectUtils";
import { ExternalLink, Github, ArrowRight, FolderGit2, Sparkles } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(() => getCachedProjects());
  const [loading, setLoading] = useState(projects.length === 0);

  useEffect(() => {
    const projectsRef = ref(db, "projects");
    const unsubscribe = onValue(
      projectsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: Project[] = [];

          Object.keys(data).forEach((key) => {
            if (key !== "totalstring" && typeof data[key] === "object" && data[key] !== null) {
              list.push({
                ...data[key],
                id: key,
                features: data[key].features || [],
                coreServices: data[key].coreServices || [],
                images: data[key].images || [],
              });
            }
          });

          const sorted = sortProjectsZA(list);
          setProjects(sorted);
          saveProjectsToCache(sorted);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching homepage projects:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Display top 4 projects on the home page
  const displayProjects = projects.slice(0, 4);

  return (
    <section id="projects" className="py-24 relative">
      <div className="container px-6 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <FolderGit2 size={13} />
              Selected Work
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight">
              Featured <span className="text-gradient">Projects</span>
            </h2>
          </motion.div>

          <Link
            to="/my-projects"
            className="inline-flex items-center gap-2 px-6 py-3 glass hover:bg-white/10 rounded-2xl text-xs font-bold text-white transition-all hover:scale-105 group border border-white/10"
          >
            <span>View All Projects ({projects.length})</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="glass-card rounded-3xl h-96 animate-pulse bg-white/5 border border-white/5" />
            ))}
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-white/10">
            <FolderGit2 size={40} className="text-white/20 mx-auto mb-3" />
            <h3 className="text-lg font-bold">No projects published yet</h3>
            <p className="text-xs text-white/50 mt-1">
              Add your first project from the Admin Panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-purple-500/40 transition-all flex flex-col hover:shadow-[0_0_35px_rgba(112,0,255,0.2)]"
              >
                <div className="relative h-64 sm:h-72 overflow-hidden bg-black/40">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-black/20 to-transparent z-10" />
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/10">
                      {project.category || "Full Stack"}
                    </span>
                  </div>

                  {project.status && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {project.status}
                      </span>
                    </div>
                  )}

                  {/* Hover links overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 bg-black/60 backdrop-blur-xs">
                    {project.deployUrl && (
                      <a
                        href={project.deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/10 hover:bg-purple-600 rounded-full text-white transition-all transform hover:scale-110"
                        title="Live Demo"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/10 hover:bg-purple-600 rounded-full text-white transition-all transform hover:scale-110"
                        title="Source Code"
                      >
                        <Github size={20} />
                      </a>
                    )}
                    <Link
                      to={`/my-projects/${project.id}`}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-xs font-bold text-white hover:scale-105 transition-all"
                    >
                      Details
                    </Link>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/my-projects/${project.id}`}>
                      <h3 className="text-xl sm:text-2xl font-display font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-white/60 mb-4 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.coreServices?.slice(0, 4).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 text-xs font-medium text-purple-300 bg-purple-500/10 rounded-full border border-purple-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-white/40 font-mono flex items-center gap-1">
                        <Sparkles size={11} className="text-purple-400" /> Realtime Cloud
                      </span>
                      <Link
                        to={`/my-projects/${project.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 group/link"
                      >
                        <span>Explore Project</span>
                        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom CTA to all projects */}
        <div className="mt-16 text-center">
          <Link
            to="/my-projects"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <FolderGit2 size={18} />
            <span>Browse All {projects.length} Projects</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
