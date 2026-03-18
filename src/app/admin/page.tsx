"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { 
  FaPlus, FaTrash, FaEdit, FaSignOutAlt, FaImage, 
  FaEnvelope, FaUser, FaBriefcase, FaCertificate, 
  FaCog, FaChevronRight, FaFilePdf, FaGithub, FaLinkedin
} from "react-icons/fa";
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

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [projectType, setProjectType] = useState("project");
  
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [duration, setDuration] = useState("");
  const [expDescription, setExpDescription] = useState("");
  
  const [certName, setCertName] = useState("");
  const [certUrl, setCertUrl] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [profileGithub, setProfileGithub] = useState("");
  const [profileLinkedin, setProfileLinkedin] = useState("");
  const [typingTerms, setTypingTerms] = useState("");
  const [servicesData, setServicesData] = useState("");

  useEffect(() => {
    checkUser();
    fetchAllData();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push("/login");
    else setUser(session.user);
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
      setPhotoUrl(prRes.data.photo_url || "");
      setCvUrl(prRes.data.cv_url || "");
      setProfileGithub(prRes.data.github_url || "");
      setProfileLinkedin(prRes.data.linkedin_url || "");
      const fullBio = prRes.data.bio || "";
      
      // Handle Terms
      const termMatch = fullBio.match(/\[terms:(.*?)\]/);
      if (termMatch) {
        setTypingTerms(termMatch[1]);
      } else {
        setTypingTerms("UI Testing, API Testing, CI/CD");
      }

      // Handle Services
      const svcMatch = fullBio.match(/\[services:(.*?)\]/);
      if (svcMatch) {
        setServicesData(svcMatch[1]);
      } else {
        setServicesData("Framework Design|Custom end-to-end automation architectures.,API Testing|High-performance REST & GraphQL validation.");
      }

      const cleanBio = fullBio
        .replace(termMatch ? termMatch[0] : "", "")
        .replace(svcMatch ? svcMatch[0] : "", "")
        .trim();
      setBio(cleanBio);
    }
    setIsLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    let table = "";
    let data: any = {};

    if (activeTab === "projects") {
      table = "projects";
      data = { title, description, image_url: JSON.stringify(imageUrls), github_url: githubUrl, live_url: liveUrl, type: projectType };
    } else if (activeTab === "experience") {
      table = "experience";
      data = { role, company, duration, description: expDescription };
    } else if (activeTab === "certs") {
      table = "certifications";
      data = { name: certName, certification_url: certUrl };
    } else if (activeTab === "profile") {
      table = "profiles";
      const meta = `[terms:${typingTerms}] [services:${servicesData}]`;
      data = { 
        full_name: fullName, 
        bio: `${bio} ${meta}`, 
        photo_url: photoUrl, 
        cv_url: cvUrl, 
        github_url: profileGithub, 
        linkedin_url: profileLinkedin 
      };
    }

    if (isEditing || (activeTab === "profile" && profile)) {
      const id = activeTab === "profile" ? profile?.id : currentId;
      await supabase.from(table).update(data).eq("id", id);
    } else {
      await supabase.from(table).insert([data]);
    }

    resetForm();
    await fetchAllData();
  }

  async function handleDelete(id: any, table: string) {
    if (!confirm("Confirm deletion?")) return;
    setIsLoading(true);
    await supabase.from(table).delete().eq("id", id);
    await fetchAllData();
  }

  function handleEdit(item: any) {
    setIsEditing(true);
    setCurrentId(item.id);
    if (activeTab === "projects") {
      setTitle(item.title);
      setDescription(item.description);
      try {
        setImageUrls(item.image_url.startsWith('[') ? JSON.parse(item.image_url) : [item.image_url]);
      } catch { setImageUrls([item.image_url]); }
      setGithubUrl(item.github_url || "");
      setLiveUrl(item.live_url || "");
      setProjectType(item.type || "project");
    } else if (activeTab === "experience") {
      setRole(item.role); setCompany(item.company); setDuration(item.duration); setExpDescription(item.description);
    } else if (activeTab === "certs") {
      setCertName(item.name); setCertUrl(item.certification_url || "");
    }
  }

  function resetForm() {
    setIsEditing(false); setCurrentId(null);
    setTitle(""); setDescription(""); setImageUrls([]); setGithubUrl(""); setLiveUrl(""); setProjectType("project");
    setRole(""); setCompany(""); setDuration(""); setExpDescription("");
    setCertName(""); setCertUrl("");
  }

  async function handleFileUpload(file: File, bucket: string, pathPrefix: string) {
    setIsUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;
    
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setIsUploading(false);
      return publicUrl;
    }
    setIsUploading(false);
    return null;
  }

  if (!user) return null;

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => { setActiveTab(id); resetForm(); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id ? "bg-white/10 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={18} className={activeTab === id ? "text-sky-400" : ""} />
      <span>{label}</span>
      {id === "messages" && messages.some(m => !m.is_read) && (
        <div className="ml-auto w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
      )}
    </button>
  );

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-[#020617] text-slate-200">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 p-6 flex flex-col shrink-0">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-black border-2 border-slate-900 shadow-[0_0_15px_rgba(14,165,233,0.3)]">P</div>
            <span className="font-bold tracking-tight text-lg text-white">Console<span className="text-sky-500">.v1</span></span>
          </div>

          <div className="space-y-1 mb-auto">
            <SidebarItem id="projects" label="Works" icon={FaBriefcase} />
            <SidebarItem id="experience" label="Experience" icon={FaUser} />
            <SidebarItem id="certs" label="Certs" icon={FaCertificate} />
            <SidebarItem id="profile" label="Settings" icon={FaCog} />
            <SidebarItem id="messages" label="Inbox" icon={FaEnvelope} />
          </div>

          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all mt-8 border border-transparent hover:border-red-400/10">
            <FaSignOutAlt size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 overflow-y-auto max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 capitalize">{activeTab}</h1>
              <p className="text-slate-500 text-sm">System configuration / {activeTab}</p>
            </div>
            {activeTab !== "messages" && activeTab !== "profile" && !isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="primary" className="bg-white text-black hover:bg-slate-200 px-6 h-11 flex items-center gap-2 rounded-xl">
                <FaPlus size={14} /> New Record
              </Button>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Form Column */}
            <div className={isEditing || activeTab === "profile" ? "block" : "hidden lg:block lg:opacity-30 pointer-events-none"}>
              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-8 text-xs font-mono text-sky-400 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  Editor Active
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {activeTab === "projects" && (
                    <>
                      <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="saas-input" placeholder="Project Name" />
                      <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="saas-input" placeholder="Technical system overview..." />
                      <div className="grid grid-cols-2 gap-4">
                        <select value={projectType} onChange={e => setProjectType(e.target.value)} className="saas-input">
                          <option value="project">Project</option>
                          <option value="writeup">Writeup</option>
                        </select>
                        <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} className="saas-input" placeholder="GitHub Repository URL" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Technical Assets</label>
                        <div className="grid grid-cols-3 gap-3">
                          {imageUrls.map((url, i) => (
                            <div key={i} className="relative aspect-video rounded-xl bg-slate-800 border border-slate-700 overflow-hidden group">
                              <img src={url} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaTrash size={14} className="text-white" />
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-video rounded-xl border-2 border-dashed border-slate-800 hover:border-sky-500/30 flex flex-col items-center justify-center text-slate-500 transition-all">
                            <FaPlus size={16} />
                            <span className="text-[10px] mt-2">Upload</span>
                          </button>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={async (e) => {
                          if (!e.target.files) return;
                          const newUrls = [...imageUrls];
                          for (const file of Array.from(e.target.files)) {
                            const url = await handleFileUpload(file, "portfolio-assets", "projects");
                            if (url) newUrls.push(url);
                          }
                          setImageUrls(newUrls);
                        }} />
                      </div>
                    </>
                  )}

                  {activeTab === "experience" && (
                    <>
                      <input type="text" required value={role} onChange={e => setRole(e.target.value)} className="saas-input" placeholder="Role (e.g. Senior QA Engineer)" />
                      <input type="text" required value={company} onChange={e => setCompany(e.target.value)} className="saas-input" placeholder="Company Name" />
                      <input type="text" required value={duration} onChange={e => setDuration(e.target.value)} className="saas-input" placeholder="Duration (e.g. 2021 - Present)" />
                      <textarea required rows={4} value={expDescription} onChange={e => setExpDescription(e.target.value)} className="saas-input" placeholder="Key achievements and technical stack..." />
                    </>
                  )}

                  {activeTab === "certs" && (
                    <>
                      <input type="text" required value={certName} onChange={e => setCertName(e.target.value)} className="saas-input" placeholder="Certification Name" />
                      <input type="url" value={certUrl} onChange={e => setCertUrl(e.target.value)} className="saas-input" placeholder="Credential URL" />
                    </>
                  )}

                  {activeTab === "profile" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 mb-8">
                        <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-slate-700 shrink-0 cursor-pointer overflow-hidden relative group">
                          {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : <FaImage className="m-auto absolute inset-0 text-slate-600" size={24} />}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><FaEdit size={16} /></div>
                        </div>
                        <div className="flex-1">
                          <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="saas-input mb-3" placeholder="Full Name" />
                          <div onClick={() => cvInputRef.current?.click()} className="px-4 py-2 border border-slate-800 rounded-lg text-xs text-slate-500 hover:bg-white/5 cursor-pointer transition-all flex items-center gap-2 w-fit">
                            <FaFilePdf /> {cvUrl ? "Update CV" : "Upload CV"}
                          </div>
                          <input type="file" ref={cvInputRef} className="hidden" accept=".pdf" onChange={async e => {
                            if (e.target.files?.[0]) {
                              const url = await handleFileUpload(e.target.files[0], "portfolio-assets", "cvs");
                              if (url) setCvUrl(url);
                            }
                          }} />
                        </div>
                      </div>
                      <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="saas-input" placeholder="Professional Summary..." />
                      <div className="space-y-4">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Metadata Config</label>
                        <input type="text" value={typingTerms} onChange={e => setTypingTerms(e.target.value)} className="saas-input" placeholder="Typewriter Phrases (comma-separated)" />
                        <textarea rows={3} value={servicesData} onChange={e => setServicesData(e.target.value)} className="saas-input" placeholder="Services (Format: Title|Desc, Title|Desc...)" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="url" value={profileGithub} onChange={e => setProfileGithub(e.target.value)} className="saas-input" placeholder="GitHub Profile URL" />
                        <input type="url" value={profileLinkedin} onChange={e => setProfileLinkedin(e.target.value)} className="saas-input" placeholder="LinkedIn Profile URL" />
                      </div>
                    </div>
                  )}

                  {/* Shared Logic for Experience/Certs can follow same clean style */}

                  <div className="pt-4 flex gap-4">
                    <button type="submit" disabled={isUploading} className="flex-1 h-12 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]">
                      {isLoading ? "Saving..." : isEditing ? "Update Core" : "Commit Changes"}
                    </button>
                    {isEditing && (
                      <button type="button" onClick={resetForm} className="px-6 h-12 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all font-medium">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* List Column */}
            <div className={`space-y-4 ${activeTab === "profile" ? "hidden" : "block"}`}>
              {activeTab === "projects" && projects.map(p => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-6 group hover:border-sky-500/30 transition-all shadow-lg">
                  <div className="w-20 h-20 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700/50">
                    <img 
                      src={p.image_url?.startsWith('[') ? JSON.parse(p.image_url)[0] : (p.image_url || "/placeholder.png")} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-lg mb-1 truncate">{p.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(p.id, "projects")} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"><FaTrash size={14} /></button>
                  </div>
                </div>
              ))}

              {activeTab === "experience" && experience.map(exp => (
                <div key={exp.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl group hover:border-sky-500/30 transition-all shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-white text-lg">{exp.role}</h3>
                      <p className="text-sky-400 text-xs font-mono tracking-widest">{exp.company} • {exp.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(exp)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all"><FaEdit size={12} /></button>
                      <button onClick={() => handleDelete(exp.id, "experience")} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-red-500/10 text-slate-500 transition-all"><FaTrash size={12} /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{exp.description}</p>
                </div>
              ))}

              {activeTab === "certs" && certs.map(cert => (
                <div key={cert.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between group hover:border-sky-500/30 transition-all shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
                      <FaCertificate />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{cert.name}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">ID: {cert.id.toString().slice(0,8)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(cert)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all"><FaEdit size={12} /></button>
                    <button onClick={() => handleDelete(cert.id, "certifications")} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-red-500/10 text-slate-500 transition-all"><FaTrash size={12} /></button>
                  </div>
                </div>
              ))}

              {activeTab === "messages" && messages.map(m => (
                <div key={m.id} className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl transition-all ${!m.is_read ? 'border-sky-500/30 bg-sky-500/[0.02]' : 'opacity-60 grayscale-[0.5]'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">{m.name[0]}</div>
                      <div>
                        <p className="font-bold text-white">{m.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{m.email} • {new Date(m.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(m.id, "messages")} className="text-slate-600 hover:text-red-400 transition-colors"><FaTrash size={14} /></button>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-light pl-14">{m.message}</p>
                </div>
              ))}
              
              {/* Other lists (Experience/Certs) can use similar clean cards */}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .saas-input { 
          @apply w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 
                 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 
                 focus:border-sky-500/50 transition-all text-sm font-sans shadow-inner; 
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </PageTransition>
  );
}
