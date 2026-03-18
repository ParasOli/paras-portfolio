"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt, FaChevronRight } from "react-icons/fa";

interface ProjectCardProps {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  imageUrls?: string[];
  githubUrl?: string;
  liveUrl?: string;
  className?: string;
}

export default function ProjectCard({
  title,
  description,
  category,
  imageUrl,
  imageUrls = [],
  githubUrl,
  liveUrl,
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
      className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-sky-500/30 transition-all duration-500 flex flex-col h-full group"
    >
      {/* Media View Port */}
      <div className="p-6 pb-0">
        <div className="relative aspect-[16/10] bg-slate-950/50 rounded-2xl overflow-hidden border border-white/5 group-hover:border-sky-500/20 transition-all duration-700">
          <AnimatePresence mode="wait">
            {images.length > 0 ? (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7, ease: "circOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={images[currentIndex]}
                  alt={title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-800 font-mono text-[9px] tracking-widest uppercase">
                [MEDIA_NULL]
              </div>
            )}
          </AnimatePresence>

          {/* Status Overlay */}
          <div className="absolute top-4 left-4 z-20">
            <div className="status-badge bg-slate-950/80 backdrop-blur-md border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              {category}
            </div>
          </div>

          {/* Navigation Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {images.map((_, i) => (
                <motion.div 
                  key={i} 
                  animate={{ 
                    width: i === currentIndex ? 20 : 4,
                    backgroundColor: i === currentIndex ? "#38bdf8" : "rgba(255,255,255,0.2)"
                  }}
                  className="h-1 rounded-full transition-colors"
                />
              ))}
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
        </div>
      </div>

      {/* Content Engine */}
      <div className="p-8 flex flex-col flex-1 relative">
        {/* Slanted Title Backdrop */}
        <div className="absolute top-0 left-0 w-full h-16 bg-slate-950/80 -skew-y-2 origin-left -translate-y-4 z-0 border-b border-sky-500/10" />
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <h3 className="text-xl font-bold text-sky-400 leading-tight group-hover:text-sky-300 transition-colors">
            {title}
          </h3>
          <div className="flex gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noreferrer" className="text-white hover:text-sky-400 transition-colors">
                <FaGithub size={18} />
              </a>
            )}
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noreferrer" className="text-white hover:text-sky-400 transition-colors">
                <FaExternalLinkAlt size={16} />
              </a>
            )}
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed font-light mb-8 flex-1">
          {description}
        </p>

        {/* Technical Footer */}
        <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex gap-3">
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Build: Success</span>
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Tests: Verified</span>
          </div>
          <motion.div 
            whileHover={{ x: 3 }}
            className="text-[10px] font-bold text-sky-500 uppercase tracking-widest cursor-pointer flex items-center gap-2"
          >
            Details <FaChevronRight size={8} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
