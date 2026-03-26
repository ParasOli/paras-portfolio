"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/lib/supabase";
import CropModal from "@/components/CropModal";
import { 
  FaPlus, FaTrash, FaEdit, FaSignOutAlt, FaImage, 
  FaEnvelope, FaUser, FaBriefcase, FaCertificate, 
  FaCog, FaFilePdf, FaGripVertical
} from "react-icons/fa";
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
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentId, setCurrentId] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"avatar" | "project" | null>(null);
  const [cropAspect, setCropAspect] = useState(1);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [projectType, setProjectType] = useState("project");
  const [toolsUsed, setToolsUsed] = useState("");
  
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
    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        setAuthChecking(false);
        fetchAllData();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setAuthChecking(false);
        fetchAllData();
      } else {
        router.push("/login");
      }
    });
  }, []);

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
      
      const termMatch = fullBio.match(/\[terms:(.*?)\]/);
      setTypingTerms(termMatch ? termMatch[1] : "");
      const chatMatch = fullBio.match(/\[chat:(.*?)\]/);
      setChatbotContext(chatMatch ? chatMatch[1] : "");
      const chatNameMatch = fullBio.match(/\[chat_name:(.*?)\]/);
      setChatbotName(chatNameMatch ? chatNameMatch[1] : "");
      const chatSubMatch = fullBio.match(/\[chat_sub:(.*?)\]/);
      setChatbotSubtitle(chatSubMatch ? chatSubMatch[1] : "");
      const cvFileMatch = fullBio.match(/\[cv_file:(.*?)\]/);
      setCvFilename(cvFileMatch ? cvFileMatch[1] : "");
      const emailMatch = fullBio.match(/\[email:(.*?)\]/);
      setTypingEmail(emailMatch ? emailMatch[1] : "");

      setOrderProjects(ordProjIds);
      setOrderExperience(ordExpIds);
      setOrderCerts(ordCertsIds);

      const cleanBio = fullBio
        .replace(/\[terms:.*?\]/g, "")
        .replace(/\[chat:.*?\]/g, "")
        .replace(/\[chat_name:.*?\]/g, "")
        .replace(/\[chat_sub:.*?\]/g, "")
        .replace(/\[cv_file:.*?\]/g, "")
        .replace(/\[email:.*?\]/g, "")
        .replace(/\[order_projects:.*?\]/g, "")
        .replace(/\[order_experience:.*?\]/g, "")
        .replace(/\[order_certs:.*?\]/g, "")
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
    if (type === "projects") { setProjects(items as Project[]); setOrderProjects(newOrderIds); }
    else if (type === "experience") { setExperience(items as Experience[]); setOrderExperience(newOrderIds); }
    else { setCerts(items as Certification[]); setOrderCerts(newOrderIds); }
    if (profile) {
      const meta = `[terms:${typingTerms}] [chat:${chatbotContext}] [chat_name:${chatbotName}] [chat_sub:${chatbotSubtitle}] [cv_file:${cvFilename}] [email:${typingEmail}] [order_projects:${type === "projects" ? newOrderIds.join(",") : orderProjects.join(",")}] [order_experience:${type === "experience" ? newOrderIds.join(",") : orderExperience.join(",")}] [order_certs:${type === "certs" ? newOrderIds.join(",") : orderCerts.join(",")}]`;
      await supabase.from("profiles").update({ bio: `${bio} ${meta}` }).eq("id", profile.id);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleFileUpload(blob: Blob | File, bucket: string, pathPrefix: string) {
    setIsUploading(true);
    try {
      const ext = blob instanceof File ? (blob.name.split(".").pop() || "jpg") : "jpg";
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${pathPrefix}/${fileName}`;
      
      const { error } = await supabase.storage.from(bucket).upload(filePath, blob);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    } catch (err: any) {
      alert("Upload failed: " + err.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  function openCropForAvatar(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropSrc(e.target?.result as string);
      setCropTarget("avatar");
      setCropAspect(1);
    };
    reader.readAsDataURL(file);
  }

  function openCropForProject(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropSrc(e.target?.result as string);
      setCropTarget("project");
      setCropAspect(16 / 9);
    };
    reader.readAsDataURL(file);
  }

  async function handleCropDone(blob: Blob) {
    setCropSrc(null);
    if (cropTarget === "avatar") {
      const url = await handleFileUpload(blob, "portfolio-assets", "avatars");
      if (url) setPhotoUrl(url);
    } else if (cropTarget === "project") {
      const url = await handleFileUpload(blob, "portfolio-assets", "projects");
      if (url) setImageUrls(prev => [...prev, url]);
    }
    setCropTarget(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    let table = "";
    let data: any = {};

    if (activeTab === "projects") {
      table = "projects";
      data = { title, description, image_url: JSON.stringify(imageUrls), github_url: githubUrl, live_url: liveUrl, type: projectType, tools_used: toolsUsed };
    } else if (activeTab === "experience") {
      table = "experience";
      data = { role, company, duration, description: expDescription };
    } else if (activeTab === "certs") {
      table = "certifications";
      data = { name: certName, certification_url: certUrl };
    } else if (activeTab === "profile") {
      table = "profiles";
      const meta = `[terms:${typingTerms}] [chat:${chatbotContext}] [chat_name:${chatbotName}] [chat_sub:${chatbotSubtitle}] [cv_file:${cvFilename}] [email:${typingEmail}] [order_projects:${orderProjects.join(",")}] [order_experience:${orderExperience.join(",")}] [order_certs:${orderCerts.join(",")}]`;
      data = { full_name: fullName, bio: `${bio} ${meta}`, photo_url: photoUrl, cv_url: cvUrl, github_url: profileGithub, linkedin_url: profileLinkedin };
    }

    try {
      const isUpdating = isEditing || (activeTab === "profile" && profile);
      const id = activeTab === "profile" ? profile?.id : currentId;
      
      if (isUpdating) {
        const { error } = await supabase.from(table).update(data).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert([data]);
        if (error) throw error;
      }
      alert("Saved!");
      resetForm();
      await fetchAllData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: any, table: string) {
    if (!confirm("Delete?")) return;
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      await fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function handleEdit(item: any) {
    setIsEditing(true);
    setCurrentId(item.id);
    if (activeTab === "projects") {
      setTitle(item.title); setDescription(item.description);
      try { setImageUrls(JSON.parse(item.image_url)); } catch { setImageUrls([item.image_url]); }
      setGithubUrl(item.github_url || ""); setLiveUrl(item.live_url || ""); setProjectType(item.type || "project");
      setToolsUsed(item.tools_used || "");
    } else if (activeTab === "experience") {
      setRole(item.role); setCompany(item.company); setDuration(item.duration); setExpDescription(item.description);
    } else if (activeTab === "certs") {
      setCertName(item.name); setCertUrl(item.certification_url || "");
    }
  }

  function resetForm() {
    setIsEditing(false); setIsAdding(false); setCurrentId(null);
    setTitle(""); setDescription(""); setImageUrls([]); setGithubUrl(""); setLiveUrl(""); setProjectType("project"); setToolsUsed("");
    setRole(""); setCompany(""); setDuration(""); setExpDescription(""); setCertName(""); setCertUrl("");
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => { setActiveTab(id); resetForm(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>
      <Icon size={18} className={activeTab === id ? "text-sky-400" : ""} />
      <span className="text-sm font-medium">{label}</span>
      {id === "messages" && messages.some(m => !m.is_read) && <div className="ml-auto w-2 h-2 bg-sky-500 rounded-full" />}
    </button>
  );

  return (
    <PageTransition>
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          aspect={cropAspect}
          cropShape={cropTarget === "avatar" ? "round" : "rect"}
          onCrop={handleCropDone}
          onCancel={() => { setCropSrc(null); setCropTarget(null); }}
        />
      )}
      <div className="flex min-h-screen bg-[#020617] text-slate-200">
        <aside className="w-64 border-r border-slate-800 p-6 flex flex-col shrink-0">
          <div className="flex items-center gap-3 mb-10 px-2 font-bold text-lg text-white">Console<span className="text-sky-500">.v1</span></div>
          <div className="space-y-1 mb-auto">
            <SidebarItem id="projects" label="Works" icon={FaBriefcase} />
            <SidebarItem id="experience" label="Experience" icon={FaUser} />
            <SidebarItem id="certs" label="Certs" icon={FaCertificate} />
            <SidebarItem id="profile" label="Settings" icon={FaCog} />
            <SidebarItem id="messages" label="Inbox" icon={FaEnvelope} />
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 transition-all mt-8"><FaSignOutAlt size={18} /><span>Sign Out</span></button>
        </aside>

        <main className="flex-1 p-10 overflow-y-auto max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-white capitalize">{activeTab}</h1>
            {activeTab !== "messages" && activeTab !== "profile" && !isEditing && !isAdding && (
              <button onClick={() => setIsAdding(true)} className="bg-sky-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm">Add New</button>
            )}
          </div>

          {(isEditing || isAdding || activeTab === "profile") && (
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === "projects" && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="saas-input" placeholder="Title" />
                      <select value={projectType} onChange={e => setProjectType(e.target.value)} className="saas-input">
                        <option value="project">Project</option><option value="writeup">Writeup</option>
                      </select>
                      <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} className="saas-input" placeholder="GitHub" />
                      <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} className="saas-input" placeholder="Live Demo" />
                      <input type="text" value={toolsUsed} onChange={e => setToolsUsed(e.target.value)} className="saas-input" placeholder="Tools used (comma-separated, e.g. Cypress, Postman)" />
                    </div>
                    <div className="space-y-4">
                      <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="saas-input" placeholder="Description" />
                      <div className="grid grid-cols-3 gap-3">
                        {imageUrls.map((url, i) => (
                          <div key={i} className="relative aspect-video rounded-xl overflow-hidden group border border-white/5">
                            <img src={url} className="w-full h-full object-cover" />
                            <button onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100"><FaTrash size={12} /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-slate-500"><FaPlus /></button>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "experience" && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" required value={role} onChange={e => setRole(e.target.value)} className="saas-input" placeholder="Role" />
                    <input type="text" required value={company} onChange={e => setCompany(e.target.value)} className="saas-input" placeholder="Company" />
                    <input type="text" required value={duration} onChange={e => setDuration(e.target.value)} className="saas-input" placeholder="Duration" />
                    <textarea required rows={4} value={expDescription} onChange={e => setExpDescription(e.target.value)} className="saas-input" placeholder="Key Achievements" />
                  </div>
                )}
                {activeTab === "certs" && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" required value={certName} onChange={e => setCertName(e.target.value)} className="saas-input" placeholder="Cert Name" />
                    <input type="url" value={certUrl} onChange={e => setCertUrl(e.target.value)} className="saas-input" placeholder="Cert URL" />
                  </div>
                )}
                {activeTab === "profile" && (
                  <div className="space-y-8">
                    <div className="flex gap-8">
                      <div className="text-center">
                        <div onClick={() => avatarInputRef.current?.click()} className="w-24 h-24 rounded-2xl bg-slate-950 border border-white/5 mx-auto cursor-pointer relative group overflow-hidden">
                          {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : <FaImage className="m-auto absolute inset-0 text-slate-700" size={24} />}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><FaEdit size={16} /></div>
                        </div>
                        <p className="text-[10px] text-slate-600 uppercase mt-2">Avatar</p>
                      </div>
                      <div className="flex-1 space-y-4">
                        <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="saas-input" placeholder="Full Name" />
                        <div onClick={() => cvInputRef.current?.click()} className="px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-400 cursor-pointer flex items-center gap-2"><FaFilePdf /> {cvUrl ? "Update CV" : "Upload CV"}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="saas-input" placeholder="Bio" />
                      <div className="space-y-4">
                        <input type="url" value={profileGithub} onChange={e => setProfileGithub(e.target.value)} className="saas-input" placeholder="GitHub" />
                        <input type="url" value={profileLinkedin} onChange={e => setProfileLinkedin(e.target.value)} className="saas-input" placeholder="LinkedIn" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                      <input type="text" value={chatbotName} onChange={e => setChatbotName(e.target.value)} className="saas-input" placeholder="Bot Name" />
                      <input type="text" value={chatbotSubtitle} onChange={e => setChatbotSubtitle(e.target.value)} className="saas-input" placeholder="Bot Subtitle" />
                      <input type="text" value={typingTerms} onChange={e => setTypingTerms(e.target.value)} className="saas-input" placeholder="Typewriter terms (comma-separated)" />
                      <input type="text" value={cvFilename} onChange={e => setCvFilename(e.target.value)} className="saas-input" placeholder="CV download filename" />
                    </div>
                    <textarea rows={5} value={chatbotContext} onChange={e => setChatbotContext(e.target.value)} className="saas-input" placeholder="AI Intelligence Context" />
                  </div>
                )}
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={isUploading || isLoading} className="px-10 h-11 bg-white text-black font-bold rounded-xl hover:bg-sky-400 transition-all">{isLoading ? "Saving..." : "Save Changes"}</button>
                  {(isEditing || isAdding) && <button type="button" onClick={resetForm} className="px-6 h-11 bg-slate-800 rounded-xl">Dismiss</button>}
                </div>
              </form>
            </div>
          )}

          <div className={`mt-10 space-y-4 ${activeTab === "profile" ? "hidden" : ""}`}>
            {activeTab === "projects" && (
              <DragDropContext onDragEnd={(r) => handleOnDragEnd(r, "projects")}>
                <Droppable droppableId="projects">{(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {projects.map((p, index) => (
                      <Draggable key={p.id} draggableId={p.id.toString()} index={index}>{(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="bg-slate-900 p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:border-sky-500/20 transition-all">
                          <div {...provided.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab px-1"><FaGripVertical size={14} /></div>
                          <img src={p.image_url?.startsWith('[') ? JSON.parse(p.image_url)[0] : p.image_url} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1"><p className="font-bold text-sm text-white">{p.title}</p><p className="text-xs text-slate-500">{p.type}</p></div>
                          <div className="flex gap-2"><button onClick={() => handleEdit(p)} className="p-2 text-slate-400"><FaEdit size={14} /></button><button onClick={() => handleDelete(p.id, "projects")} className="p-2 text-slate-400"><FaTrash size={14} /></button></div>
                        </div>
                      )}</Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}</Droppable>
              </DragDropContext>
            )}
            {activeTab === "experience" && (
              <DragDropContext onDragEnd={(r) => handleOnDragEnd(r, "experience")}>
                <Droppable droppableId="experience">{(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {experience.map((exp, index) => (
                      <Draggable key={exp.id} draggableId={exp.id.toString()} index={index}>{(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="bg-slate-900 p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:border-sky-500/20 transition-all">
                          <div {...provided.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab px-1"><FaGripVertical size={14} /></div>
                          <div className="flex-1"><p className="font-bold text-sm text-white">{exp.role}</p><p className="text-xs text-sky-400">{exp.company}</p></div>
                          <div className="flex gap-2"><button onClick={() => handleEdit(exp)} className="p-2 text-slate-400"><FaEdit size={14} /></button><button onClick={() => handleDelete(exp.id, "experience")} className="p-2 text-slate-400"><FaTrash size={14} /></button></div>
                        </div>
                      )}</Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}</Droppable>
              </DragDropContext>
            )}
            {activeTab === "certs" && (
              <DragDropContext onDragEnd={(r) => handleOnDragEnd(r, "certs")}>
                <Droppable droppableId="certs">{(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {certs.map((c, index) => (
                      <Draggable key={c.id} draggableId={c.id.toString()} index={index}>{(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="bg-slate-900 p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:border-sky-500/20 transition-all">
                          <div {...provided.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab px-1"><FaGripVertical size={14} /></div>
                          <div className="flex-1"><p className="font-bold text-sm text-white">{c.name}</p></div>
                          <div className="flex gap-2"><button onClick={() => handleEdit(c)} className="p-2 text-slate-400"><FaEdit size={14} /></button><button onClick={() => handleDelete(c.id, "certifications")} className="p-2 text-slate-400"><FaTrash size={14} /></button></div>
                        </div>
                      )}</Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}</Droppable>
              </DragDropContext>
            )}
            {activeTab === "messages" && messages.map(m => (
              <div key={m.id} className="bg-slate-900 p-5 rounded-2xl">
                <div className="flex justify-between items-start mb-2"><p className="font-bold text-white text-sm">{m.name}</p><button onClick={() => handleDelete(m.id, "messages")} className="text-slate-600"><FaTrash size={12} /></button></div>
                <p className="text-xs text-slate-400">{m.message}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Global Inputs */}
        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={async (e) => {
          if (!e.target.files) return;
          // Crop each project image
          const file = e.target.files[0];
          if (file) openCropForProject(file);
          e.target.value = "";
        }} />
        <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => {
          if (e.target.files?.[0]) { openCropForAvatar(e.target.files[0]); e.target.value = ""; }
        }} />
        <input type="file" ref={cvInputRef} className="hidden" accept=".pdf" onChange={async (e) => {
          if (e.target.files?.[0]) {
            const url = await handleFileUpload(e.target.files[0], "portfolio-assets", "cvs");
            if (url) setCvUrl(url);
          }
        }} />
      </div>

      <style jsx>{`
        .saas-input { @apply w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/30 transition-all; }
      `}</style>
    </PageTransition>
  );
}
