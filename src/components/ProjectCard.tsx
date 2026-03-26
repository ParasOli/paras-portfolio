"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

interface ProjectCardProps {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  imageUrls?: string[];
  githubUrl?: string;
  liveUrl?: string;
  tools?: string[];
}

export default function ProjectCard({
  title,
  description,
  category,
  imageUrl,
  imageUrls = [],
  githubUrl,
  liveUrl,
  tools = [],
}: ProjectCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 2000);
    } else {
      setCurrentIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-sky-500/20 transition-all duration-500 flex flex-col h-full group"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] bg-slate-950/50 overflow-hidden">
        <AnimatePresence mode="wait">
          {images.length > 0 ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="absolute inset-0"
            >
              <Image
                src={images[currentIndex]}
                alt={title}
                fill
                className="object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-700"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-800 font-mono text-[8px] tracking-widest uppercase">
              [NO MEDIA]
            </div>
          )}
        </AnimatePresence>

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/5 text-[9px] font-bold text-sky-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            {category}
          </div>
        </div>

        {/* Image nav dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {images.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === currentIndex ? 16 : 4, backgroundColor: i === currentIndex ? "#38bdf8" : "rgba(255,255,255,0.2)" }}
                className="h-1 rounded-full"
              />
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-base font-bold text-white leading-snug group-hover:text-sky-400 transition-colors mb-2">
          {title}
        </h3>

        <p className={`text-slate-500 text-xs leading-relaxed font-light mb-1 ${isHovered ? "" : "line-clamp-3"}`}>
          {description}
        </p>
        {description.length > 120 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsHovered(h => !h); }}
            className="text-sky-500 text-[10px] font-bold uppercase tracking-widest mb-3 hover:text-sky-400 transition-colors"
          >
            {isHovered ? "Show less ↑" : "Read more ↓"}
          </button>
        )}

        {/* Tools */}
        {tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tools.map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 rounded-md bg-slate-800 border border-white/5 text-[9px] font-mono text-slate-400 uppercase tracking-wide"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-sky-500/30 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white transition-all"
            >
              <FaGithub size={13} />
              <span>Source</span>
            </a>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-500/10 hover:bg-sky-500 border border-sky-500/20 hover:border-sky-500 rounded-xl text-[11px] font-bold text-sky-400 hover:text-white transition-all"
            >
              <FaExternalLinkAlt size={11} />
              <span>Live</span>
            </a>
          )}
          {!liveUrl && !githubUrl && (
            <div className="w-full text-center py-2.5 text-[9px] font-mono text-slate-700 uppercase tracking-widest">
              Private Repository
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
