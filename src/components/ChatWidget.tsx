"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaTimes, FaPaperPlane, FaUser } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const { profile } = useProfile();
  
  // Hide on admin/login routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return null;

  // Extract Branding from Bio
  const chatNameMatch = profile?.bio?.match(/\[chat_name:(.*?)\]/);
  const chatSubMatch = profile?.bio?.match(/\[chat_sub:(.*?)\]/);
  const chatName = chatNameMatch ? chatNameMatch[1] : "Portfolio AI";
  const chatSub = chatSubMatch ? chatSubMatch[1] : "Expert System v1.1";

  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: `Hi! I'm ${chatName}. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // No more automatic hide for teaser - let it stay until interaction or close
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    setShowTeaser(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, { role: "user", content: userMsg }] 
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: "ai", content: data.text }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error. Please try again later." }]);
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[10000]">
      {/* Teaser Popup */}
      <AnimatePresence>
        {showTeaser && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20, x: 20 }}
            className="absolute bottom-16 right-0 sm:bottom-20 sm:right-4 z-[10000] bg-white text-slate-900 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl rounded-br-none shadow-2xl border border-sky-100 flex items-center gap-2 sm:gap-3 cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
            <p className="text-[10px] sm:text-xs font-bold whitespace-nowrap">Hi! Need help with QA or projects?</p>
            <div className="absolute -bottom-2 right-0 w-3 h-3 bg-white rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTeaser(false);
        }}
        initial={{ y: 0 }}
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 sm:w-16 sm:h-16 bg-sky-500 text-white rounded-full shadow-[0_10px_40px_rgba(14,165,233,0.4)] flex items-center justify-center border-2 border-white/20 hover:bg-sky-400 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 rounded-full bg-sky-400 animate-pulse opacity-20 group-hover:opacity-40" />
        {isOpen ? <FaTimes size={18} className="relative z-10 sm:size-20" /> : <FaRobot size={20} className="relative z-10 sm:size-24" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
            className="fixed bottom-20 right-4 w-[calc(100vw-32px)] max-w-[340px] sm:absolute sm:bottom-20 sm:right-0 sm:w-[380px] h-[500px] sm:h-[550px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-600 to-sky-400 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FaRobot size={16} className="sm:size-18" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">{chatName}</h3>
                  <p className="text-[8px] sm:text-[9px] text-white/70 uppercase tracking-widest font-mono">{chatSub}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close Chat"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 custom-scrollbar bg-slate-950/20">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-xl sm:rounded-2xl text-[12px] sm:text-[13px] ${
                    m.role === "user" 
                      ? "bg-sky-500 text-white rounded-tr-none" 
                      : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5"
                  }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-50">
                      {m.role === "user" ? <FaUser size={8} /> : <FaRobot size={9} />}
                      <span className="text-[9px] font-bold uppercase tracking-tight">{m.role === "user" ? "You" : "AI"}</span>
                    </div>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-xl rounded-tl-none border border-white/5 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 bg-slate-900 border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-[12px] sm:text-[13px] text-slate-200 focus:outline-none focus:border-sky-500/50 transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sky-500 hover:text-sky-400 disabled:opacity-30 p-2"
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}
