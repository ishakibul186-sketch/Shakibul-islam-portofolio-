import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, push, set, get } from "firebase/database";
import { db } from "../../lib/firebase";
import { Article } from "../../types/article";
import { DEFAULT_ARTICLES } from "../../data/defaultArticles";
import { getCachedArticles, saveArticlesToCache } from "../../lib/articleUtils";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../lib/cropImage";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  X, 
  Plus, 
  Loader2,
  Info,
  Search,
  Check,
  FileText,
  Sparkles
} from "lucide-react";

export default function AddArticle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState<Partial<Article>>({
    title: "",
    excerpt: "",
    content: "",
    category: "Architecture",
    tags: [],
    image: "",
    date: new Date().toISOString().split("T")[0],
    readingTime: "6 min read",
    author: "Shakibul Islam Prohor",
    slug: "",
    seo: {
      title: "",
      description: "",
      keywords: "",
    }
  });

  const [tagInput, setTagInput] = useState("");

  // Cropping State
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (id) {
      setFetching(true);
      const defaultMatch = DEFAULT_ARTICLES.find((a) => a.id === id || a.slug === id);
      if (defaultMatch) {
        setFormData(defaultMatch);
      }

      const articleRef = ref(db, `articles/${id}`);
      get(articleRef).then((snapshot) => {
        if (snapshot.exists()) {
          setFormData(snapshot.val());
        }
        setFetching(false);
      }).catch((err) => {
        console.error("Error fetching article:", err);
        setFetching(false);
      });
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("seo.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo!, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto slug
      if (name === "title") {
        const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        setFormData(prev => ({ ...prev, slug, seo: { ...prev.seo!, title: value } }));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCroppedImage = async () => {
    if (imageToCrop && croppedAreaPixels) {
      setLoading(true);
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setFormData(prev => ({ ...prev, image: croppedImage }));
        setIsCropping(false);
        setImageToCrop(null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalData = {
        ...formData,
        createdAt: formData.createdAt || Date.now(),
      };

      if (id) {
        await set(ref(db, `articles/${id}`), finalData);
        const existing = getCachedArticles();
        const updated = existing.map((a) => (a.id === id ? ({ ...a, ...finalData } as Article) : a));
        saveArticlesToCache(updated);
      } else {
        const newRef = await push(ref(db, "articles"), finalData);
        if (newRef.key) {
          const existing = getCachedArticles();
          saveArticlesToCache([{ id: newRef.key, ...finalData } as Article, ...existing]);
        }
      }
      navigate("/admin/articles");
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Failed to save article.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
        <button 
          onClick={() => navigate("/admin/articles")}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            {id ? "Edit Article" : "Create New Article"}
          </h1>
          <p className="text-xs text-slate-500">Draft, format, and publish your content to the world</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Article Title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-lg font-bold text-slate-900"
                placeholder="The Future of Web Development..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Slug (URL Path)</label>
              <input 
                type="text" 
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs font-mono text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Short Excerpt *</label>
              <textarea 
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-sm text-slate-900"
                placeholder="A brief summary for card view..."
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Content (Markdown)</label>
                <span className="text-[11px] text-slate-400">Markdown syntax supported</span>
              </div>
              <textarea 
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={14}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono text-xs leading-relaxed text-slate-900"
                placeholder="Write your article here in markdown format..."
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Search size={18} className="text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">SEO Optimization</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Meta Title</label>
                <input 
                  type="text" 
                  name="seo.title"
                  value={formData.seo?.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Meta Keywords</label>
                <input 
                  type="text" 
                  name="seo.keywords"
                  value={formData.seo?.keywords}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs text-slate-900"
                  placeholder="tech, coding, react..."
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Meta Description</label>
              <textarea 
                name="seo.description"
                value={formData.seo?.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon size={16} className="text-indigo-600" />
                Featured Image (Cover)
              </h3>
              
              <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 group hover:border-indigo-400 transition-all">
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                    <Plus size={28} className="text-slate-400 mb-1 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-xs font-bold text-indigo-600">Click to upload image</span>
                    <span className="text-[10px] text-slate-400">Cropped to 16:9</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs text-slate-800"
                >
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Backend">Backend</option>
                  <option value="Personal">Personal</option>
                  <option value="AI">AI</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-[11px] font-semibold">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Type tag and press Enter..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Published Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Read Time</label>
                  <input 
                    type="text" 
                    name="readingTime"
                    value={formData.readingTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-white shadow-sm shadow-indigo-200 hover:scale-[1.02] transition-all disabled:opacity-50 text-xs"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {id ? "Update Article" : "Publish Article"}
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
            <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Markdown syntax is supported for code snippets, blockquotes, headers, and lists.
            </p>
          </div>
        </div>
      </form>

      {/* Image Cropping Modal */}
      {isCropping && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Crop Featured Image</h3>
                <p className="text-xs text-slate-500">16:9 aspect ratio</p>
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
                  onClick={handleSaveCroppedImage}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-white shadow-xs text-xs"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
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
