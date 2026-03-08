"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Folder,
  Globe,
  Trash2,
  Pencil,
  ArrowLeft,
  Loader2,
  X,
  Check,
  LayoutGrid,
  Image as ImageIcon,
  Palette,
  Search,
} from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

export default function WorkspacesPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const workspaces = useQuery(
    api.workspaces.listByUser,
    user ? { userId: user._id } : "skip"
  );
  const createWorkspace = useMutation(api.workspaces.create);
  const deleteWorkspace = useMutation(api.workspaces.remove);
  const updateWorkspace = useMutation(api.workspaces.update);
  const updateWebsiteInfo = useMutation(api.workspaces.updateWebsiteInfo);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<Id<"workspaces"> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"workspaces"> | null>(null);
  const [searchWebsite, setSearchWebsite] = useState(true);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    industry: "",
    website: "",
    defaultLanguage: "ar" as "en" | "ar",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const resetForm = () => {
    setForm({ name: "", slug: "", industry: "", website: "", defaultLanguage: "ar" });
    setShowCreate(false);
    setEditingId(null);
  };

  // Fetch website and save info to workspace (client-side)
  const fetchAndSaveWebsiteInfo = async (workspaceId: Id<"workspaces">, url: string) => {
    try {
      const res = await fetch('/api/fetch-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) return;
      const data = await res.json();
      await updateWebsiteInfo({
        id: workspaceId,
        websiteInfo: {
          companyName: data.companyName || "",
          description: data.description || "",
          industry: data.industry || "",
          features: data.features || [],
          targetAudience: data.targetAudience || undefined,
          tone: data.tone || undefined,
          contact: data.contact ? {
            phone: data.contact.phone || undefined,
            email: data.contact.email || undefined,
            address: data.contact.address || undefined,
            socialMedia: data.contact.socialMedia || undefined,
          } : undefined,
          ogImage: data.ogImage || undefined,
          rawContent: data.rawContent || "",
          fetchedAt: Date.now(),
        },
      });
    } catch {
      // silently fail — website info is optional
    }
  };

  const handleCreate = async () => {
    if (!user || !form.name.trim()) return;
    const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const websiteUrl = form.website.trim() || undefined;
    const workspaceId = await createWorkspace({
      userId: user._id,
      name: form.name.trim(),
      slug,
      industry: form.industry || undefined,
      website: websiteUrl,
      defaultLanguage: form.defaultLanguage,
    });
    // Fetch website info in background after creation
    if (searchWebsite && websiteUrl) {
      fetchAndSaveWebsiteInfo(workspaceId, websiteUrl);
    }
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name.trim()) return;
    const websiteUrl = form.website.trim() || undefined;
    await updateWorkspace({
      id: editingId,
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      industry: form.industry || undefined,
      website: websiteUrl,
      defaultLanguage: form.defaultLanguage,
    });
    // Re-fetch website info if URL changed and checkbox is on
    if (searchWebsite && websiteUrl) {
      fetchAndSaveWebsiteInfo(editingId, websiteUrl);
    }
    resetForm();
  };

  const handleDelete = async (id: Id<"workspaces">) => {
    await deleteWorkspace({ id });
    setDeleteConfirm(null);
  };

  const startEdit = (ws: NonNullable<typeof workspaces>[number]) => {
    setEditingId(ws._id);
    setForm({
      name: ws.name,
      slug: ws.slug,
      industry: ws.industry ?? "",
      website: ws.website ?? "",
      defaultLanguage: ws.defaultLanguage,
    });
    setShowCreate(true);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                <span className="text-slate-900 font-black text-lg">S</span>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight">Workspaces</h1>
                <p className="text-xs text-slate-500 font-medium">Manage your projects</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.image && (
              <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm font-bold text-slate-400">{user.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-slate-400 text-sm font-medium">
              {workspaces?.length ?? 0} workspace{workspaces?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowCreate(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </button>
        </div>

        {/* Create/Edit Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#151921] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black">
                  {editingId ? "Edit Workspace" : "New Workspace"}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 block mb-1.5">
                    Project Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                    placeholder="e.g. Sylo, My App"
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 block mb-1.5">
                    Slug
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated-from-name"
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 block mb-1.5">
                      Industry
                    </label>
                    <select
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm appearance-none"
                    >
                      <option value="">Select...</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="saas">SaaS</option>
                      <option value="retail">Retail</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 block mb-1.5">
                      Language
                    </label>
                    <div className="flex h-11 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setForm({ ...form, defaultLanguage: "ar" })}
                        className={`flex-1 text-sm font-bold transition-colors ${form.defaultLanguage === "ar" ? "bg-white text-slate-900" : "text-white/50 hover:text-white"}`}
                      >
                        العربية
                      </button>
                      <button
                        onClick={() => setForm({ ...form, defaultLanguage: "en" })}
                        className={`flex-1 text-sm font-bold transition-colors ${form.defaultLanguage === "en" ? "bg-white text-slate-900" : "text-white/50 hover:text-white"}`}
                      >
                        English
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 block mb-1.5">
                    Website
                  </label>
                  <input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                  />
                  {form.website.trim() && (
                    <label className="flex items-center gap-2.5 mt-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.08] transition-colors">
                      <input
                        type="checkbox"
                        checked={searchWebsite}
                        onChange={(e) => setSearchWebsite(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
                      />
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-white/70">AI: Analyze website</span>
                      </div>
                      <span className="text-[10px] text-white/30">Auto</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="flex-1 h-11 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingId ? handleUpdate : handleCreate}
                  disabled={!form.name.trim()}
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {editingId ? "Save Changes" : "Create Workspace"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Grid */}
        {!workspaces ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-400 mb-2">No workspaces yet</h3>
            <p className="text-sm text-slate-500 mb-6">Create your first workspace to start designing</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <div
                key={ws._id}
                className="group bg-[#151921] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all relative"
              >
                {/* Delete Confirmation */}
                {deleteConfirm === ws._id && (
                  <div className="absolute inset-0 bg-[#151921]/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 p-4">
                    <p className="text-sm font-bold mb-4 text-center">Delete &ldquo;{ws.name}&rdquo;?<br /><span className="text-slate-500 font-medium">This will remove all collections & posts.</span></p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 border border-white/10 rounded-lg text-sm font-bold hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(ws._id)}
                        className="px-4 py-2 bg-red-600 rounded-lg text-sm font-bold hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                    <Folder className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(ws)}
                      className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(ws._id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                <Link href={`/design?workspace=${ws._id}`} className="block">
                  <h3 className="text-base font-black mb-1 tracking-tight">{ws.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mb-3">/{ws.slug}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    {ws.industry && (
                      <span className="flex items-center gap-1">
                        <LayoutGrid className="w-3 h-3" />
                        {ws.industry}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {ws.defaultLanguage === "ar" ? "Arabic" : "English"}
                    </span>
                  </div>
                </Link>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                  <WorkspaceStats workspaceId={ws._id} />
                </div>
              </div>
            ))}

            {/* New Workspace Card */}
            <button
              onClick={() => { resetForm(); setShowCreate(true); }}
              className="border-2 border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-white/20 hover:bg-white/[0.02] transition-all min-h-[200px]"
            >
              <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-sm font-bold text-slate-500">New Workspace</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mini stats for each workspace card
function WorkspaceStats({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  const collections = useQuery(api.collections.listByWorkspace, { workspaceId });
  const branding = useQuery(api.branding.getByWorkspace, { workspaceId });

  return (
    <>
      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
        <LayoutGrid className="w-3 h-3" />
        {collections?.length ?? 0} collection{collections?.length !== 1 ? "s" : ""}
      </span>
      {branding && (
        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <Palette className="w-3 h-3" />
          {branding.brandName}
        </span>
      )}
    </>
  );
}
