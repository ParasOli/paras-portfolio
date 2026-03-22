"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { 
  FaPlus, FaTrash, FaEdit, FaSignOutAlt, FaImage, 
  FaEnvelope, FaUser, FaBriefcase, FaCertificate, 
  FaCog, FaChevronRight, FaFilePdf, FaGithub, FaLinkedin,
  FaGripVertical
} from "react-icons/fa";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

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
  const [isAdding, setIsAdding] = useState(false);
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
  const [typingEmail, setTypingEmail] = useState("");
  const [typingTerms, setTypingTerms] = useState("");
  const [chatbotContext, setChatbotContext] = useState("");
  const [chatbotName, setChatbotName] = useState("");
  const [chatbotSubtitle, setChatbotSubtitle] = useState("");
  const [cvFilename, setCvFilename] = useState("");
  const [orderProjects, setOrderProjects] = useState<string[]>([]);
  const [orderExperience, setOrderExperience] = useState<string[]>([]);
  const [orderCerts, setOrderCerts] = useState<string[]>([]);

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

    const ordProjIds = prRes.data?.bio.match(/\[order_projects:(.*?)\]/)?.[1]?.split(",") || [];
    const ordExpIds = prRes.data?.bio.match(/\[order_experience:(.*?)\]/)?.[1]?.split(",") || [];
    const ordCertsIds = prRes.data?.bio.match(/\[order_certs:(.*?)\]/)?.[1]?.split(",") || [];

    const sortItems = (items: any[], ids: string[]) => {
      if (!ids.length) return items;
      return [...items].sort((a, b) => {
        const aIndex = ids.indexOf(a.id.toString());
        const bIndex = ids.indexOf(b.id.toString());
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    };

    setProjects(sortItems(pRes.data || [], ordProjIds));
    setExperience(sortItems(eRes.data || [], ordExpIds));
    setCerts(sortItems(cRes.data || [], ordCertsIds));
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

      // Handle Chatbot Context
      const chatMatch = fullBio.match(/\[chat:(.*?)\]/);
      if (chatMatch) {
        setChatbotContext(chatMatch[1]);
      } else {
        setChatbotContext("");
      }

      // Handle Chatbot Name
      const chatNameMatch = fullBio.match(/\[chat_name:(.*?)\]/);
      if (chatNameMatch) {
        setChatbotName(chatNameMatch[1]);
      } else {
        setChatbotName("Portfolio AI");
      }

      // Handle Chatbot Subtitle
      const chatSubMatch = fullBio.match(/\[chat_sub:(.*?)\]/);
      if (chatSubMatch) {
        setChatbotSubtitle(chatSubMatch[1]);
      } else {
        setChatbotSubtitle("Expert System v1.1");
      }

      // Handle Ordering Metadata
      const cvFileMatch = fullBio.match(/\[cv_file:(.*?)\]/);
      const emailMatch = fullBio.match(/\[email:(.*?)\]/);
      const ordProjMatch = fullBio.match(/\[order_projects:(.*?)\]/);
      const ordExpMatch = fullBio.match(/\[order_experience:(.*?)\]/);
      const ordCertsMatch = fullBio.match(/\[order_certs:(.*?)\]/);
      setOrderProjects(ordProjMatch ? ordProjMatch[1].split(",") : []);
      setOrderExperience(ordExpMatch ? ordExpMatch[1].split(",") : []);
      setOrderCerts(ordCertsMatch ? ordCertsMatch[1].split(",") : []);

      const cleanBio = fullBio
        .replace(termMatch ? termMatch[0] : "", "")
        .replace(chatMatch ? chatMatch[0] : "", "")
        .replace(chatNameMatch ? chatNameMatch[0] : "", "")
        .replace(chatSubMatch ? chatSubMatch[0] : "", "")
        .replace(cvFileMatch ? cvFileMatch[0] : "", "")
        .replace(emailMatch ? emailMatch[0] : "", "")
        .replace(ordProjMatch ? ordProjMatch[0] : "", "")
        .replace(ordExpMatch ? ordExpMatch[0] : "", "")
        .replace(ordCertsMatch ? ordCertsMatch[0] : "", "")
        .trim();
      setBio(cleanBio);
    }
    setIsLoading(false);
  }

  async function handleOnDragEnd(result: DropResult, type: "projects" | "experience" | "certs") {
    if (!result.destination) return;

    const items = type === "projects" ? [...projects] : type === "experience" ? [...experience] : [...certs];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem as any);

    const newOrderIds = items.map(i => i.id.toString());
    
    if (type === "projects") {
      setProjects(items as Project[]);
      setOrderProjects(newOrderIds);
    } else if (type === "experience") {
      setExperience(items as Experience[]);
      setOrderExperience(newOrderIds);
    } else {
      setCerts(items as Certification[]);
      setOrderCerts(newOrderIds);
    }

    // Auto-save order to profile metadata
    if (profile) {
      const meta = `[terms:${typingTerms}] [chat:${chatbotContext}] [chat_name:${chatbotName}] [chat_sub:${chatbotSubtitle}] [cv_file:${cvFilename}] [email:${typingEmail}] [order_projects:${type === "projects" ? newOrderIds.join(",") : orderProjects.join(",")}] [order_experience:${type === "experience" ? newOrderIds.join(",") : orderExperience.join(",")}] [order_certs:${type === "certs" ? newOrderIds.join(",") : orderCerts.join(",")}]`;
      await supabase.from("profiles").update({ bio: `${bio} ${meta}` }).eq("id", profile.id);
    }
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
      const meta = `[terms:${typingTerms}] [chat:${chatbotContext}] [chat_name:${chatbotName}] [chat_sub:${chatbotSubtitle}] [cv_file:${cvFilename}] [email:${typingEmail}] [order_projects:${orderProjects.join(",")}] [order_experience:${orderExperience.join(",")}] [order_certs:${orderCerts.join(",")}]`;
      data = { 
        full_name: fullName, 
        bio: `${bio} ${meta}`, 
        photo_url: photoUrl, 
        cv_url: cvUrl, 
        github_url: profileGithub, 
        linkedin_url: profileLinkedin 
      };
    }

    try {
      const isUpdating = isEditing || (activeTab === "profile" && profile);
      
      if (isUpdating) {
        const id = activeTab === "profile" ? profile?.id : currentId;
        if (!id && activeTab !== "profile") throw new Error("Missing record ID for update.");
        
        const { error } = await supabase.from(table).update(data).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert([data]);
        if (error) throw error;
      }

      alert("Changes saved successfully!");
      resetForm();
      await fetchAllData();
    } catch (err: any) {
      console.error("Submission error:", err);
      alert(`Error saving changes: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: any, table: string) {
    if (!confirm("Confirm deletion?")) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      alert("Deleted successfully!");
      await fetchAllData();
    } catch (err: any) {
      console.error("Deletion error:", err);
      alert(`Error deleting record: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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
    setIsEditing(false); setIsAdding(false); setCurrentId(null);
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
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight capitalize">{activeTab}</h1>
              <p className="text-slate-500 text-xs mt-1">Manage your {activeTab} section content.</p>
            </div>
            {activeTab !== "messages" && activeTab !== "profile" && !isEditing && !isAdding && (
              <button 
                onClick={() => { resetForm(); setIsAdding(true); }} 
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-[0_10px_30px_rgba(14,165,233,0.3)]"
              >
                <FaPlus size={12} /> Add New
              </button>
            )}
          </div>

          <div className="space-y-8">
            {/* Editor Phase */}
            {(isEditing || isAdding || activeTab === "profile") && (
              <div className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    {isEditing ? "Edit Entry" : "Creation Terminal"}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                  {activeTab === "projects" && (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="admin-label">Basic Info</label>
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="saas-input" placeholder="Project Name" />
                        <select value={projectType} onChange={e => setProjectType(e.target.value)} className="saas-input">
                          <option value="project">Project</option>
                          <option value="writeup">Writeup</option>
                        </select>
                        <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} className="saas-input" placeholder="GitHub Repository URL" />
                        <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} className="saas-input" placeholder="Live Demo URL" />
                      </div>
                      <div className="space-y-4">
                        <label className="admin-label">Description & Media</label>
                        <textarea required rows={5} value={description} onChange={e => setDescription(e.target.value)} className="saas-input" placeholder="Technical overview..." />
                        <div className="grid grid-cols-3 gap-3">
                          {imageUrls.map((url, i) => (
                            <div key={i} className="relative aspect-video rounded-xl bg-slate-800 border border-white/5 overflow-hidden group">
                              <img src={url} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaTrash size={14} className="text-white" />
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-video rounded-xl border-2 border-dashed border-white/5 hover:border-sky-500/20 flex flex-col items-center justify-center text-slate-500 transition-all">
                            <FaPlus size={16} />
                          </button>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={async (e) => {
                          if (!e.target.files) return;
                          for (const file of Array.from(e.target.files)) {
                            const url = await handleFileUpload(file, "portfolio-assets", "projects");
                            if (url) setImageUrls(prev => [...prev, url]);
                          }
                        }} />
                      </div>
                    </div>
                  )}

                  {activeTab === "experience" && (
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                        <label className="admin-label">Position details</label>
                        <input type="text" required value={role} onChange={e => setRole(e.target.value)} className="saas-input" placeholder="Role (e.g. Senior QA Engineer)" />
                        <input type="text" required value={company} onChange={e => setCompany(e.target.value)} className="saas-input" placeholder="Company Name" />
                        <input type="text" required value={duration} onChange={e => setDuration(e.target.value)} className="saas-input" placeholder="Duration (e.g. 2021 - Present)" />
                      </div>
                      <div className="space-y-4">
                        <label className="admin-label">Responsibilities</label>
                        <textarea required rows={7} value={expDescription} onChange={e => setExpDescription(e.target.value)} className="saas-input" placeholder="Key achievements..." />
                      </div>
                    </div>
                  )}

                  {activeTab === "certs" && (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="admin-label">Certification Details</label>
                        <input type="text" required value={certName} onChange={e => setCertName(e.target.value)} className="saas-input" placeholder="Certification Name" />
                        <input type="url" value={certUrl} onChange={e => setCertUrl(e.target.value)} className="saas-input" placeholder="Credential URL" />
                      </div>
                    </div>
                  )}

                  {activeTab === "profile" && (
                    <div className="space-y-10">
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="space-y-4">
                          <label className="admin-label text-center block">Profile Avatar</label>
                          <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 rounded-[2.5rem] bg-slate-950 border border-white/5 mx-auto shrink-0 cursor-pointer overflow-hidden relative group shadow-2xl">
                            {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : <FaImage className="m-auto absolute inset-0 text-slate-700" size={32} />}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm"><FaEdit size={20} className="text-white" /></div>
                          </div>
                        </div>
                        <div className="flex-1 space-y-4">
                           <label className="admin-label">Primary Info</label>
                           <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="saas-input" placeholder="Full Name" />
                           <div className="flex gap-4">
                             <div onClick={() => cvInputRef.current?.click()} className="flex-1 px-5 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all flex items-center justify-center gap-2">
                               <FaFilePdf size={14} /> {cvUrl ? "Update Resume" : "Upload Resume"}
                             </div>
                             <input type="file" ref={cvInputRef} className="hidden" accept=".pdf" onChange={async e => {
                               if (e.target.files?.[0]) {
                                  const file = e.target.files[0];
                                  const fileExt = file.name.split('.').pop();
                                  const safeBase = cvFilename ? cvFilename.replace(/[^a-zA-Z0-9._-]/g, '_') : 'cv_' + Date.now();
                                  const fileName = safeBase.toLowerCase().endsWith('.' + fileExt) ? safeBase : safeBase + '.' + fileExt;
                                  setIsUploading(true);
                                  const { error: upErr } = await supabase.storage.from('portfolio-assets').upload('cvs/' + fileName, file, { upsert: true });
                                  if (!upErr) {
                                    const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl('cvs/' + fileName);
                                    setCvUrl(publicUrl);
                                  }
                                  setIsUploading(false);
                               }
                             }} />
                           </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <label className="admin-label">Biography & Socials</label>
                          <textarea rows={5} value={bio} onChange={e => setBio(e.target.value)} className="saas-input" placeholder="Professional Summary..." />
                          <div className="flex gap-3">
                            <input type="url" value={profileGithub} onChange={e => setProfileGithub(e.target.value)} className="saas-input" placeholder="GitHub URL" />
                            <input type="url" value={profileLinkedin} onChange={e => setProfileLinkedin(e.target.value)} className="saas-input" placeholder="LinkedIn URL" />
                          </div>
                        </div>
                        <div className="space-y-4">
                           <label className="admin-label">Chat & Interaction</label>
                           <input type="text" value={typingTerms} onChange={e => setTypingTerms(e.target.value)} className="saas-input" placeholder="Hero Typewriter Keywords (comma-separated)" />
                           <div className="grid grid-cols-2 gap-3">
                              <input type="text" value={chatbotName} onChange={e => setChatbotName(e.target.value)} className="saas-input" placeholder="Chat Name" />
                              <input type="text" value={chatbotSubtitle} onChange={e => setChatbotSubtitle(e.target.value)} className="saas-input" placeholder="Chat Subtitle" />
                           </div>
                           <input type="text" value={cvFilename} onChange={e => setCvFilename(e.target.value)} className="saas-input" placeholder="CV Filename (e.g. Paras_Oli_CV.pdf)" />
                        </div>
                      </div>
                      
                      <div className="space-y-4 border-t border-white/5 pt-8">
                        <label className="admin-label">AI Intelligence Context</label>
                        <textarea rows={6} value={chatbotContext} onChange={e => setChatbotContext(e.target.value)} className="saas-input" placeholder="Tell the AI who you are and how it should represent you..." />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6">
                    <button type="submit" disabled={isUploading || isLoading} className="h-12 px-10 bg-white text-black font-bold rounded-xl hover:bg-sky-400 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)]">
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    {(isEditing || isAdding) && (
                      <button type="button" onClick={resetForm} className="h-12 px-8 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all font-medium">
                        Dismiss
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* List Phase */}
            <div className={`space-y-6 ${activeTab === "profile" ? "hidden" : "block"}`}>
              {activeTab === "projects" && (
                <DragDropContext onDragEnd={(res) => handleOnDragEnd(res, "projects")}>
                  <Droppable droppableId="projects">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {projects.map((p, index) => (
                          <Draggable key={p.id} draggableId={p.id.toString()} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center gap-5 group hover:border-emerald-500/20 transition-all group shadow-sm">
                                <div {...provided.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab px-1">
                                  <FaGripVertical size={14} />
                                </div>
                                <div className="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-white/5">
                                  <img src={p.image_url?.startsWith('[') ? JSON.parse(p.image_url)[0] : (p.image_url || "/placeholder.png")} className="w-full h-full object-cover opacity-80" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-200 text-sm truncate">{p.title}</p>
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.description}</p>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => handleEdit(p)} className="p-2 text-slate-500 hover:text-white transition-colors"><FaEdit size={14} /></button>
                                  <button onClick={() => handleDelete(p.id, "projects")} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><FaTrash size={14} /></button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {activeTab === "experience" && (
                <DragDropContext onDragEnd={(res) => handleOnDragEnd(res, "experience")}>
                  <Droppable droppableId="experience">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {experience.map((exp, index) => (
                          <Draggable key={exp.id} draggableId={exp.id.toString()} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl transition-all group shadow-sm">
                                <div className="flex items-center gap-4">
                                  <div {...provided.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab">
                                    <FaGripVertical size={14} />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-bold text-slate-200 text-sm">{exp.role}</h3>
                                    <p className="text-[11px] text-sky-400 font-medium tracking-tight mt-0.5">{exp.company} • {exp.duration}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button onClick={() => handleEdit(exp)} className="p-2 text-slate-500 hover:text-white transition-colors"><FaEdit size={14} /></button>
                                    <button onClick={() => handleDelete(exp.id, "experience")} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><FaTrash size={14} /></button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {activeTab === "certs" && (
                <DragDropContext onDragEnd={(res) => handleOnDragEnd(res, "certs")}>
                  <Droppable droppableId="certs">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {certs.map((cert, index) => (
                          <Draggable key={cert.id} draggableId={cert.id.toString()} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center justify-between transition-all group shadow-sm">
                                <div className="flex items-center gap-4">
                                  <div {...provided.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab">
                                    <FaGripVertical size={14} />
                                  </div>
                                  <div className="w-9 h-9 rounded-lg bg-sky-500/5 flex items-center justify-center text-sky-500/50 border border-white/5">
                                    <FaCertificate size={14} />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-slate-200 text-sm">{cert.name}</h3>
                                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">Verified Credential</p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => handleEdit(cert)} className="p-2 text-slate-500 hover:text-white transition-colors"><FaEdit size={14} /></button>
                                  <button onClick={() => handleDelete(cert.id, "certifications")} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><FaTrash size={14} /></button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {activeTab === "messages" && messages.map(m => (
                <div key={m.id} className={`bg-slate-920 border border-white/5 p-6 rounded-2xl transition-all ${!m.is_read ? 'border-sky-500/20 shadow-lg' : 'opacity-40'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-slate-600 font-bold border border-white/5">{m.name[0]}</div>
                      <div>
                        <p className="font-bold text-slate-200">{m.name}</p>
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">{m.email} • {new Date(m.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(m.id, "messages")} className="text-slate-700 hover:text-red-400 transition-colors"><FaTrash size={14} /></button>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-light pl-14">{m.message}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .saas-input { 
          @apply w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-slate-200 
                 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500/20 
                 focus:border-sky-500/30 transition-all text-sm font-sans; 
        }
        .admin-label {
          @apply text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-2 block;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </PageTransition>
  );
}
