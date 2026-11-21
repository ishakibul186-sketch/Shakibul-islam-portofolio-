import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { Project } from "../types/project";
import { getCachedProjects, saveProjectsToCache, sortProjectsZA } from "../lib/projectUtils";
import { DEFAULT_PROJECTS } from "../data/defaultProjects";
import { ExternalLink, Github, ArrowRight, FolderGit2 } from "lucide-react";
import SafeImage from "./common/SafeImage";

const ease = [0.16, 1, 0.3, 1] as const;

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

          if (list.length > 0) {
            const sorted = sortProjectsZA(list);
            setProjects(sorted);
            saveProjectsToCache(sorted);
          } else {
            setProjects(DEFAULT_PROJECTS);
          }
        } else {
          setProjects(DEFAULT_PROJECTS);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching homepage projects:", error);
        setProjects((prev) => (prev.length > 0 ? prev : DEFAULT_PROJECTS));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const displayProjects = projects.slice(0, 4);

  return (
    <section id="projects" className="py-24 bg-zinc-50/60 border-b border-zinc-200">
      <div className="container px-6 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease }}
          >
            <p className="text-xs font-semibold text-blue-600 tracking-wide mb-2">
              03. Selected Work
            </p>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-zinc-950">
              Featured Projects
            </h2>
          </motion.div>

          <Link
            to="/my-projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 transition-colors group whitespace-nowrap shrink-0"
          >
            <span>View All Projects ({projects.length})</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {loading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-96 animate-pulse border border-zinc-200" />
            ))}
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
            <FolderGit2 size={36} className="text-zinc-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-950">No projects published yet</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Add your first project from the Admin Panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayProjects.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.07, ease }}
                className="group bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:border-zinc-300 transition-colors duration-200 flex flex-col"
              >
                <Link
                  to={`/my-projects/${project.id}`}
                  className="relative aspect-[16/10] overflow-hidden bg-zinc-100 block border-b border-zinc-200"
                >
                  <SafeImage
                    src={project.thumbnail}
                    alt={project.title}
                    fallbackTitle={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </Link>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Unboxed Metadata Line */}
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-2.5">
                      <span>{project.category || "Full Stack"}</span>
                      {project.status && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-semibold">{project.status}</span>
                        </>
                      )}
                    </div>

                    <Link to={`/my-projects/${project.id}`}>
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-zinc-950 mb-2.5 group-hover:text-blue-600 transition-colors duration-150">
                        {project.title}
                      </h3>
                    </Link>

                    <p className="text-zinc-600 mb-5 text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    {/* Clean unboxed stack text */}
                    {project.coreServices && project.coreServices.length > 0 && (
                      <p className="text-xs font-mono text-zinc-500 mb-6 truncate">
                        {project.coreServices.slice(0, 4).join(" / ")}
                      </p>
                    )}

                    <div className="pt-4 border-t border-zinc-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {project.deployUrl && (
                          <a
                            href={project.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
                            title="Live Demo"
                            aria-label={`Live Demo for ${project.title}`}
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
                            title="Source Code"
                            aria-label={`Source Code for ${project.title}`}
                          >
                            <Github size={15} />
                          </a>
                        )}
                      </div>

                      <Link
                        to={`/my-projects/${project.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 hover:text-blue-600 transition-colors group/link whitespace-nowrap"
                      >
                        <span>Case Study</span>
                        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform duration-150" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Link
            to="/my-projects"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-zinc-950 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-colors duration-200"
          >
            <FolderGit2 size={17} />
            <span>Browse All {projects.length} Projects</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
