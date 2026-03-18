"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { FaPlus, FaTrash, FaEdit, FaSignOutAlt, FaUpload, FaImage, FaEnvelope, FaUser, FaCheck } from "react-icons/fa";
import Image from "next/image";

interface Project { id: any; title: string; description: string; image_url: string; github_url: string; live_url: string; type: string; }
interface Experience { id: any; role: string; company: string; duration: string; description: string; }
interface Certification { id: any; name: string; certification_url: string; }
interface Profile { id: any; full_name: string; bio: string; photo_url: string; cv_url: string; github_url: string; linkedin_url: string; }
interface Message { id: any; name: string; email: string; message: string; is_read: boolean; created_at: string; }

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "experience" | "certs" | "profile" | "messages">("projects");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Form State (Shared/Dynamic)
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Project Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [projectType, setProjectType] = useState("project");

  // Experience Form Fields
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [duration, setDuration] = useState("");
  const [expDescription, setExpDescription] = useState("");

  // Certification Form Fields
  const [certName, setCertName] = useState("");
  const [certUrl, setCertUrl] = useState("");

  // Profile Form Fields
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [profileGithub, setProfileGithub] = useState("");
  const [profileLinkedin, setProfileLinkedin] = useState("");

  useEffect(() => {
    checkUser();
    fetchAllData();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
    } else {
      setUser(session.user);
    }
  }

  async function fetchAllData() {
    setIsLoading(true);
    const [pRes, eRes, cRes, prRes, mRes] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("experience").select("*").order("created_at", { ascending: false }),
      supabase.from("certifications").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").limit(1).single(),
      supabase.from("messages").select("*").order("created_at", { ascending: false })
    ]);

    setProjects(pRes.data || []);
    setExperience(eRes.data || []);
    setCerts(cRes.data || []);
    setProfile(prRes.data || null);
    setMessages(mRes.data || []);
    if (prRes.data) {
      setFullName(prRes.data.full_name || "");
      setBio(prRes.data.bio || "");
      setPhotoUrl(prRes.data.photo_url || "");
      setCvUrl(prRes.data.cv_url || "");
      setProfileGithub(prRes.data.github_url || "");
      setProfileLinkedin(prRes.data.linkedin_url || "");
    }
    setIsLoading(false);
  }

  async function handleLogout() {
    console.log("Logout initiated...");
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error);
    console.log("Redirecting to login...");
    router.push("/login");
  }

  // --- Handlers ---

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, bucket: string, pathPrefix: string, setUrl: (url: string) => void) {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${pathPrefix}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setUrl(publicUrl);
    } catch (error: any) {
      console.error("Storage Error Details:", { bucket, error });
      alert(`Upload failed: ${error.message} (Bucket: ${bucket})`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    let table = "";
    let data: any = {};

    if (activeTab === "projects") {
      table = "projects";
      data = { title, description, image_url: imageUrl, github_url: githubUrl, live_url: liveUrl, type: projectType };
    } else if (activeTab === "experience") {
      table = "experience";
      data = { role, company, duration, description: expDescription };
    } else if (activeTab === "certs") {
      table = "certifications";
      data = { name: certName, certification_url: certUrl };
    } else if (activeTab === "profile") {
      table = "profiles";
      data = { 
        full_name: fullName, 
        bio: bio, 
        photo_url: photoUrl, 
        cv_url: cvUrl,
        github_url: profileGithub,
        linkedin_url: profileLinkedin
      };
    }

    if (isEditing || (activeTab === "profile" && profile)) {
      const id = activeTab === "profile" ? profile?.id : currentId;
      const { error } = await supabase.from(table).update(data).eq("id", id);
      if (error) alert("Update error: " + error.message);
    } else {
      const { error } = await supabase.from(table).insert([data]);
      if (error) alert("Insert error: " + error.message);
    }

    resetForm();
    await fetchAllData();
  }

  async function handleDelete(id: any, table: string) {
    if (!confirm("Are you sure?")) return;
    setIsLoading(true);
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) alert("Delete error: " + error.message);
    await fetchAllData();
  }

  function handleEdit(item: any) {
    setIsEditing(true);
    setCurrentId(item.id);
    if (activeTab === "projects") {
      setTitle(item.title);
      setDescription(item.description);
      setImageUrl(item.image_url);
      setGithubUrl(item.github_url || "");
      setLiveUrl(item.live_url || "");
      setProjectType(item.type || "project");
    } else if (activeTab === "experience") {
      setRole(item.role);
      setCompany(item.company);
      setDuration(item.duration);
      setExpDescription(item.description);
    } else if (activeTab === "certs") {
      setCertName(item.name);
      setCertUrl(item.certification_url || "");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setIsEditing(false);
    setCurrentId(null);
    setTitle(""); setDescription(""); setImageUrl("");
    setGithubUrl(""); setLiveUrl("");
    setProjectType("project");
    setRole(""); setCompany(""); setDuration(""); setExpDescription("");
    setCertName(""); setCertUrl("");
  }

  if (!user) return null;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Panel</h1>
            <p className="text-white/40">Manage your portfolio content</p>
          </div>
          <Button variant="secondary" onClick={handleLogout} type="button" className="flex items-center gap-2 px-6">
            <FaSignOutAlt size={16} /> Sign Out
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-12 p-1 bg-white/5 rounded-2xl w-fit">
          {[
            { id: "projects", label: "Projects" },
            { id: "experience", label: "Experience" },
            { id: "certs", label: "Certifications" },
            { id: "profile", label: "Profile Settings" },
            { id: "messages", label: "Messages" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); resetForm(); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                activeTab === tab.id ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.id === "messages" && messages.some(m => !m.is_read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="glass p-8 rounded-3xl sticky top-24" style={{ maxHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
              <h2 className="text-2xl font-semibold mb-6 shrink-0">
                {activeTab === "profile" ? "Update Profile" : isEditing ? "Edit Item" : "Add New Item"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-grow">
                {activeTab === "projects" && (
                  <>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="admin-input" placeholder="Project Title" />
                    <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="admin-input" placeholder="Description" />
                    <div className="flex gap-4">
                      <select value={projectType} onChange={e => setProjectType(e.target.value)} className="admin-input flex-1">
                        <option value="project">Standard Project</option>
                        <option value="writeup">Technical Writeup</option>
                      </select>
                    </div>
                    <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} className="admin-input" placeholder="GitHub Repository URL (optional)" />
                    <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} className="admin-input" placeholder="Live Demo URL (optional)" />
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider block">Project Screenshot</label>
                    <div onClick={() => fileInputRef.current?.click()} className="admin-upload-zone w-full overflow-hidden relative" style={{ height: '200px' }}>
                      {imageUrl ? <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" /> : <><FaImage size={24} className="mb-2 opacity-20" /><p className="text-xs opacity-40">Click to Upload</p></>}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, "portfolio-assets", "projects", setImageUrl)} />
                  </>
                )}

                {activeTab === "experience" && (
                  <>
                    <input type="text" required value={role} onChange={e => setRole(e.target.value)} className="admin-input" placeholder="Role (e.g. Senior QA)" />
                    <input type="text" required value={company} onChange={e => setCompany(e.target.value)} className="admin-input" placeholder="Company" />
                    <input type="text" required value={duration} onChange={e => setDuration(e.target.value)} className="admin-input" placeholder="Duration (e.g. 2022 - Present)" />
                    <textarea required rows={4} value={expDescription} onChange={e => setExpDescription(e.target.value)} className="admin-input" placeholder="Responsibilities" />
                  </>
                )}

                {activeTab === "certs" && (
                  <>
                    <input type="text" required value={certName} onChange={e => setCertName(e.target.value)} className="admin-input" placeholder="Certification Name" />
                    <input type="url" value={certUrl} onChange={e => setCertUrl(e.target.value)} className="admin-input" placeholder="Credential URL (optional)" />
                  </>
                )}

                {activeTab === "profile" && (
                  <>
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Full Name</label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="admin-input" placeholder="Your Name" />

                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider block mt-4">Professional Bio</label>
                    <textarea required rows={4} value={bio} onChange={e => setBio(e.target.value)} className="admin-input" placeholder="Short bio for the hero section..." />

                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider block mt-4">Profile Photo</label>
                    <div onClick={() => fileInputRef.current?.click()} className="admin-upload-zone rounded-full mx-auto shrink-0 overflow-hidden relative" style={{ width: '128px', height: '128px' }}>
                      {photoUrl ? <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" /> : <FaImage size={24} className="opacity-20" />}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, "portfolio-assets", "profile", setPhotoUrl)} />
                    
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider block mt-6">CV / Resume (PDF)</label>
                    <div onClick={() => cvInputRef.current?.click()} className="admin-upload-zone h-auto py-6 w-full" style={{ minHeight: '60px' }}>
                      <p className="text-xs opacity-40 truncate px-4">{cvUrl ? "CV Uploaded (Click to change)" : "Upload PDF Resume"}</p>
                    </div>
                    <input type="file" ref={cvInputRef} className="hidden" accept=".pdf" onChange={e => handleFileUpload(e, "portfolio-assets", "cvs", setCvUrl)} />

                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider block mt-6">Social Links</label>
                    <input type="url" value={profileGithub} onChange={e => setProfileGithub(e.target.value)} className="admin-input mb-3" placeholder="GitHub Profile URL" />
                    <input type="url" value={profileLinkedin} onChange={e => setProfileLinkedin(e.target.value)} className="admin-input" placeholder="LinkedIn Profile URL" />
                  </>
                )}

                <Button variant="primary" className="w-full py-4 justify-center">
                  {isLoading ? "Processing..." : (activeTab === "profile" ? "Save Settings" : isEditing ? "Update" : "Publish")}
                </Button>
                {isEditing && <button type="button" onClick={resetForm} className="text-xs text-white/40 w-full hover:text-white mt-2">Cancel</button>}
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {activeTab === "projects" && projects.map(p => (
                <div key={p.id} className="admin-list-card relative overflow-hidden">
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0 bg-white/5">
                    {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.title}</p>
                    <p className="text-xs text-white/40 line-clamp-1">{p.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 glass hover:bg-white/10 rounded-lg"><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(p.id, "projects")} className="p-2 glass hover:bg-red-500/20 text-red-400 rounded-lg"><FaTrash size={14} /></button>
                  </div>
                </div>
              ))}

              {activeTab === "experience" && experience.map(e => (
                <div key={e.id} className="admin-list-card">
                  <div className="flex-1">
                    <p className="font-semibold">{e.role}</p>
                    <p className="text-xs text-white/40">{e.company} • {e.duration}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(e)} className="p-2 glass hover:bg-white/10 rounded-lg"><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(e.id, "experience")} className="p-2 glass hover:bg-red-500/20 text-red-400 rounded-lg"><FaTrash size={14} /></button>
                  </div>
                </div>
              ))}

              {activeTab === "certs" && certs.map(c => (
                <div key={c.id} className="admin-list-card">
                  <div className="flex-1 italic">{c.name}</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(c)} className="p-2 glass hover:bg-white/10 rounded-lg"><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(c.id, "certifications")} className="p-2 glass hover:bg-red-500/20 text-red-400 rounded-lg"><FaTrash size={14} /></button>
                  </div>
                </div>
              ))}

              {activeTab === "messages" && (
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="glass p-12 text-center rounded-3xl text-white/40 italic">No messages found.</div>
                  ) : (
                    messages.map(m => (
                      <div key={m.id} className={`glass p-6 rounded-3xl transition-all ${!m.is_read ? 'border-white/20 bg-white/[0.05]' : 'opacity-60'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-semibold text-white">{m.name}</p>
                            <p className="text-xs text-white/40">{m.email} • {new Date(m.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            {!m.is_read && (
                              <button 
                                onClick={async () => {
                                  await supabase.from("messages").update({ is_read: true }).eq("id", m.id);
                                  fetchAllData();
                                }}
                                className="p-2 glass hover:bg-white/10 text-green-400 rounded-lg"
                                title="Mark as read"
                              >
                                <FaCheck size={14} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(m.id, "messages")} 
                              className="p-2 glass hover:bg-red-500/20 text-red-400 rounded-lg"
                              title="Delete message"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "profile" && !profile && (
                 <div className="glass p-12 text-center rounded-3xl text-white/40 font-light italic">
                   No profile settings found. Update the form to create your profile record.
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .admin-input { @apply w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-sans text-sm; }
        .admin-upload-zone { @apply relative bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all overflow-hidden text-center; }
        .admin-list-card { @apply glass p-4 rounded-2xl flex items-center gap-4 group transition-all hover:bg-white/[0.03]; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </PageTransition>
  );
}
