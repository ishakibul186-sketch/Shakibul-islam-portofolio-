import React, { useEffect, useState, useCallback } from "react";
import { ref, onValue, set, remove, get } from "firebase/database";
import { db } from "../../lib/firebase";
import { Project } from "../../types/project";
import { 
  saveProjectsToCache, 
  getCachedProjects, 
  sortProjectsZA, 
  compressImageFile 
} from "../../lib/projectUtils";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../lib/cropImage";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Github, 
  Image as ImageIcon, 
  X, 
  Save, 
  Loader2, 
  Search, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Upload,
  RefreshCw,
  FolderGit2
} from "lucide-react";

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>(() => getCachedProjects());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    description: "",
    features: [],
    coreServices: [],
    thumbnail: "",
    images: [],
    githubUrl: "",
    deployUrl: "",
    category: "Full Stack",
    status: "Live",
  });

  const [featureInput, setFeatureInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");

  // Cropper State for Thumbnail
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  // 1. Fetch & Listen to Firebase Realtime DB
  useEffect(() => {
    const projectsRef = ref(db, "projects");
    const unsubscribe = onValue(
      projectsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: Project[] = [];
          
          Object.keys(data).forEach((key) => {
            // Ignore metadata key totalstring
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
        } else {
          setProjects([]);
          saveProjectsToCache([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error loading projects:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Open Modal for Create or Edit
  const handleOpenModal = (projectToEdit?: Project) => {
    if (projectToEdit) {
      setEditingProject(projectToEdit);
      setFormData({
        ...projectToEdit,
        features: projectToEdit.features || [],
        coreServices: projectToEdit.coreServices || [],
        images: projectToEdit.images || [],
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: "",
        description: "",
        features: [],
        coreServices: ["React", "TypeScript", "Tailwind CSS"],
        thumbnail: "",
        images: [],
        githubUrl: "",
        deployUrl: "",
        category: "Full Stack",
        status: "Live",
      });
    }
    setFeatureInput("");
    setServiceInput("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setIsCropping(false);
    setImageToCrop(null);
  };

  // 3. Handle Form Changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Thumbnail file selection with cropping
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_area: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const applyCroppedThumbnail = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        const cropped = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setFormData((prev) => ({ ...prev, thumbnail: cropped }));
        setIsCropping(false);
        setImageToCrop(null);
      } catch (err) {
        console.error("Cropping error:", err);
      }
    }
  };

  // Multiple screenshot images upload
  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const base64 = await compressImageFile(files[i], 1200, 800, 0.7);
        newImages.push(base64);
      } catch (error) {
        console.error("Image upload failed", error);
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...newImages],
    }));
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, idx) => idx !== indexToRemove) || [],
    }));
  };

  // Features list manager
  const addFeature = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter") return;
    if (e && "preventDefault" in e) e.preventDefault();
    if (!featureInput.trim()) return;

    if (!formData.features?.includes(featureInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()],
      }));
    }
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index),
    }));
  };

  // Core Services / Tech stack manager
  const addCoreService = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter") return;
    if (e && "preventDefault" in e) e.preventDefault();
    if (!serviceInput.trim()) return;

    if (!formData.coreServices?.includes(serviceInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        coreServices: [...(prev.coreServices || []), serviceInput.trim()],
      }));
    }
    setServiceInput("");
  };

  const removeCoreService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      coreServices: prev.coreServices?.filter((s) => s !== service),
    }));
  };

  // 4. Save Project (Create / Update) & update totalstring
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.thumbnail) {
      alert("Please provide at least a Project Title and Thumbnail image.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingProject) {
        // Update existing project
        const projectRef = ref(db, `projects/${editingProject.id}`);
        const updatedData: Project = {
          ...(editingProject as Project),
          ...formData,
          id: editingProject.id,
          title: formData.title || "",
          description: formData.description || "",
          features: formData.features || [],
          coreServices: formData.coreServices || [],
          thumbnail: formData.thumbnail || "",
          images: formData.images || [],
          githubUrl: formData.githubUrl || "",
          deployUrl: formData.deployUrl || "",
          category: formData.category || "Full Stack",
          status: formData.status || "Live",
          updatedAt: Date.now(),
        };
        await set(projectRef, updatedData);
      } else {
        // Create new project with auto-incremented numeric ID and totalstring
        const totalRef = ref(db, "projects/totalstring");
        const totalSnap = await get(totalRef);
        let nextIndex = 1;

        if (totalSnap.exists()) {
          const currentTotal = parseInt(totalSnap.val(), 10);
          nextIndex = isNaN(currentTotal) ? projects.length + 1 : currentTotal + 1;
        } else {
          nextIndex = projects.length + 1;
        }

        const newId = `${nextIndex}`;
        const newProjectRef = ref(db, `projects/${newId}`);

        const newProjectData: Project = {
          id: newId,
          numericId: nextIndex,
          title: formData.title || "",
          description: formData.description || "",
          features: formData.features || [],
          coreServices: formData.coreServices || [],
          thumbnail: formData.thumbnail || "",
          images: formData.images || [],
          githubUrl: formData.githubUrl || "",
          deployUrl: formData.deployUrl || "",
          category: formData.category || "Full Stack",
          status: formData.status || "Live",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // Save project and increment totalstring count
        await set(newProjectRef, newProjectData);
        await set(totalRef, `${nextIndex}`);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Failed to save project to database. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Delete Project
  const handleDelete = async (id: string) => {
    try {
      await remove(ref(db, `projects/${id}`));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Could not delete project.");
    }
  };

  // Filtered list for search
  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.coreServices?.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FolderGit2 size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                My Projects
              </h1>
              <p className="text-xs text-slate-500">
                Manage your featured portfolio projects (Z-A real-time indexed)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Stats and Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Projects
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {projects.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            #
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by title, category, or core service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1.5 text-slate-400 hover:text-slate-600 mr-2"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">All Projects</span>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-200 text-slate-700 rounded-full">
              {filteredProjects.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles size={13} className="text-indigo-600" /> Z-A Sorted (Latest First)
          </span>
        </div>

        {loading && projects.length === 0 ? (
          /* Skeleton loader */
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-16 h-12 bg-slate-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
                <div className="w-20 h-8 bg-slate-200 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <FolderGit2 size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No projects found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? "No projects match your search query. Try clearing the search."
                : "You haven't added any projects yet. Click 'New Project' above to create one."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Plus size={16} /> Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-6 py-3.5">Category & Status</th>
                  <th className="px-6 py-3.5">Core Services</th>
                  <th className="px-6 py-3.5">Links</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Thumbnail & Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {project.thumbnail ? (
                            <img
                              src={project.thumbnail}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-900 truncate">
                            {project.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {project.category || "General"}
                        </span>
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {project.status || "Live"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Core Services / Tech stack tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {project.coreServices?.slice(0, 3).map((service, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100"
                          >
                            {service}
                          </span>
                        ))}
                        {(project.coreServices?.length || 0) > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded">
                            +{(project.coreServices?.length || 0) - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Links */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {project.deployUrl && (
                          <a
                            href={project.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Live Deploy Link"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="GitHub Repository"
                          >
                            <Github size={16} />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/my-projects/${project.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Public Page"
                        >
                          <Eye size={16} />
                        </a>
                        <button
                          onClick={() => handleOpenModal(project)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Project"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(project.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900">
              Delete this project?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1.5">
              This action cannot be undone. The project will be removed from your portfolio database immediately.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderGit2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    {editingProject ? "Edit Project" : "Create New Project"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Fill in project details, upload screenshots, and save to Firebase
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. AI-Powered Analytics Dashboard"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  >
                    <option value="Full Stack">Full Stack</option>
                    <option value="Web App">Web App</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="AI Tool">AI Tool</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Cloud / DevOps">Cloud / DevOps</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  >
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Project Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide an overview of the project, problem solved, and architecture..."
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  />
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink size={14} className="text-indigo-600" />
                    Deploy / Live Demo URL
                  </label>
                  <input
                    type="url"
                    name="deployUrl"
                    value={formData.deployUrl}
                    onChange={handleInputChange}
                    placeholder="https://myproject.com"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Github size={14} className="text-slate-800" />
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    placeholder="https://github.com/ishakibul186-sketch/repo"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  />
                </div>
              </div>

              {/* Core Services / Tech Stack Tags */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Core Services & Tech Stack
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.coreServices?.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => removeCoreService(service)}
                        className="hover:text-red-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyDown={addCoreService}
                    placeholder="Type technology (e.g. React, Node.js, Firebase) and press Enter..."
                    className="flex-1 px-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={addCoreService}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              {/* Key Features List */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Key Project Features
                </label>
                <div className="space-y-2 mb-2">
                  {formData.features?.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={addFeature}
                    placeholder="Type key feature and press Enter (e.g. Real-time Firebase Sync)..."
                    className="flex-1 px-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Add Feature
                  </button>
                </div>
              </div>

              {/* Photo Discover Section: Thumbnail & Multiple Screenshots */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon size={18} className="text-indigo-600" />
                  Photo Discover & Media Uploads
                </h3>

                {/* 1. Main Cover / Thumbnail Image */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Project Thumbnail (Cover Image) *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-4 bg-slate-50/50 transition-colors">
                    {formData.thumbnail ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 max-w-md mx-auto">
                        <img
                          src={formData.thumbnail}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, thumbnail: "" }))}
                          className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Remove cover"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-6 cursor-pointer text-center">
                        <Upload size={32} className="text-slate-400 mb-2" />
                        <span className="text-xs font-bold text-indigo-600">
                          Click to upload cover image (16:9)
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          JPG, PNG supported. Auto-cropped & saved as optimized base64
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleThumbnailUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 2. Multiple Gallery / Screenshot Photos */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Additional Gallery Screenshots ({formData.images?.length || 0})
                    </label>
                    <label className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1">
                      <Plus size={14} /> Add Screenshots
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleMultipleImagesUpload}
                      />
                    </label>
                  </div>

                  {formData.images && formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      {formData.images.map((imgSrc, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-white shadow-2xs"
                        >
                          <img
                            src={imgSrc}
                            alt={`Screenshot ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      No additional screenshots added yet. You can upload multiple images for the public project carousel slider.
                    </p>
                  )}
                </div>
              </div>

              {/* Submit / Action Buttons */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {editingProject ? "Update Project" : "Publish Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cropper Modal for Thumbnail */}
      {isCropping && imageToCrop && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Crop Thumbnail</h3>
                <p className="text-xs text-slate-500">16:9 ratio for perfect card presentation</p>
              </div>
              <button
                onClick={() => {
                  setIsCropping(false);
                  setImageToCrop(null);
                }}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative flex-grow min-h-[360px] bg-slate-950">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-5 border-t border-slate-100 space-y-4 bg-white">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCropping(false);
                    setImageToCrop(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCroppedThumbnail}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
