"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaTimes, FaPaperPlane, FaTrash } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";

interface Message {
  role: "user" | "ai";
  content: string;
}

const SUGGESTED = [
  "What tools do you use?",
  "Show me your projects",
  "Can I download your CV?",
  "What's your experience?",
];

const STORAGE_KEY = "portfolio_chat_history";

export default function ChatWidget() {
  const pathname = usePathname();
  const { profile } = useProfile();
  
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [hasDismissedTeaser, setHasDismissedTeaser] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "ai", content: "Hi! How can I help you?" }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollStartRef = useRef<number>(0);

  const chatNameMatch = profile?.bio?.match(/\[chat_name:(.*?)\]/);
  const chatSubMatch = profile?.bio?.match(/\[chat_sub:(.*?)\]/);
  const chatName = chatNameMatch ? chatNameMatch[1] : "Portfolio AI";
  const chatSub = chatSubMatch ? chatSubMatch[1] : "AI Assistant";

  // Initial load
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([{ role: "ai", content: `Hi! I'm ${chatName}. How can I help you today?` }]);
      }
    } catch {}
  }, [chatName]);

  // Persist
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages, mounted]);

  // Close outside
  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (!isOpen) return;
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    function handleScroll() {
      if (!isOpen) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (Math.abs(window.scrollY - scrollStartRef.current) > 80) setIsOpen(false);
    }
    if (isOpen) {
      scrollStartRef.current = window.scrollY;
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  // Teaser
  useEffect(() => {
    if (hasDismissedTeaser || isOpen) { setShowTeaser(false); return; }
    const t1 = setTimeout(() => { if (!hasDismissedTeaser && !isOpen) { setShowTeaser(true); setTimeout(() => setShowTeaser(false), 8000); } }, 5000);
    const t2 = setInterval(() => { if (!hasDismissedTeaser && !isOpen) { setShowTeaser(true); setTimeout(() => setShowTeaser(false), 8000); } }, 35000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, [hasDismissedTeaser, isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg = text.trim();
    setInput("");
    const updated = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(updated);
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role: "ai", content: data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  const clearHistory = () => {
    const fresh = [{ role: "ai" as const, content: `Hi! I'm ${chatName}. How can I help you today?` }];
    setMessages(fresh);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch {}
  };

  const showSuggestions = messages.length <= 1;

  // CONDITIONAL RETURNS MUST BE AFTER ALL HOOKS
  if (!mounted) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return null;

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[10000] flex flex-col items-end gap-3">
      {/* Teaser bubble */}
      <AnimatePresence>
        {showTeaser && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="relative bg-white border border-[var(--border)] shadow-[var(--shadow-lg)] rounded-2xl rounded-br-sm px-4 py-3 max-w-[220px] cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <TeaserText />
            <button
              onClick={(e) => { e.stopPropagation(); setShowTeaser(false); setHasDismissedTeaser(true); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--surface-2)] hover:bg-[var(--border-strong)] border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
            >
              <FaTimes size={8} />
            </button>
            <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white border-r border-b border-[var(--border)] rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button with pulse ring */}
      <div className="relative">
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[var(--accent)]/25"
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          animate={isOpen ? {} : { y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-14 h-14 sm:w-16 sm:h-16 bg-[var(--accent)] text-[var(--accent-ink)] rounded-full shadow-[0_4px_0_0_var(--accent-strong),var(--shadow)] flex items-center justify-center overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <FaTimes size={18} />
              </motion.div>
            ) : (
              <motion.div key="r" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <FaRobot size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed bottom-24 right-4 sm:right-8 w-[calc(100%-32px)] max-w-[320px] sm:max-w-[380px] h-[520px] sm:h-[560px] bg-white border border-[var(--border)] rounded-[var(--r-xl)] shadow-[var(--shadow-lg)] flex flex-col overflow-hidden z-[10001]"
          >
            <div className="p-4 bg-[var(--accent)] text-[var(--accent-ink)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[var(--accent-ink)]/10 rounded-xl flex items-center justify-center">
                  <FaRobot size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">{chatName}</h3>
                  <p className="text-[11px] font-bold text-[var(--accent-ink)]/60">{chatSub}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearHistory} title="Clear chat" className="p-1.5 hover:bg-[var(--accent-ink)]/10 rounded-lg transition-all"><FaTrash size={11} /></button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-[var(--accent-ink)]/10 rounded-lg transition-all"><FaTimes size={14} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed ${
                    m.role === "user"
                      ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold rounded-br-sm"
                      : "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-bl-sm"
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--surface)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {showSuggestions && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap shrink-0">
                {SUGGESTED.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)] hover:text-[#92700c] rounded-full text-[11px] font-bold text-[var(--muted)] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border)] shrink-0 bg-[var(--surface)] pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center gap-3">
                <input
                  type="text" value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white border border-[var(--border)] focus:border-[var(--accent-strong)] rounded-full pl-5 py-3 text-[16px] sm:text-sm font-medium text-[var(--foreground)] focus:outline-none transition-all placeholder:text-[var(--faint)] appearance-none"
                />
                <button type="submit" disabled={isLoading || !input.trim()}
                  className="w-11 h-11 bg-[var(--accent)] disabled:bg-[var(--surface-2)] disabled:text-[var(--faint)] hover:bg-[var(--accent-strong)] transition-all rounded-full flex items-center justify-center text-[var(--accent-ink)] shrink-0"
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

function TeaserText() {
  const [phase, setPhase] = useState<"dots" | "text">("dots");
  useEffect(() => {
    const t = setTimeout(() => setPhase("text"), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence mode="wait">
      {phase === "dots" ? (
        <motion.div key="dots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex gap-1 items-center h-5 px-1"
        >
          <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </motion.div>
      ) : (
        <motion.p key="text" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[var(--foreground)] font-bold leading-snug"
        >
          👋 Need help with QA or want to know more about my work?
        </motion.p>
      )}
    </AnimatePresence>
  );
}
