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
  const [expanded, setExpanded] = useState(false);

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
      className="card card-hover overflow-hidden flex flex-col h-full group"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-[var(--surface-2)] overflow-hidden">
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
                quality={95}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--faint)] text-xs font-bold">
              No preview
            </div>
          )}
        </AnimatePresence>

        {/* Category pill */}
        <div className="absolute top-3 left-3 z-20">
          <span className="tag-solid shadow-[var(--shadow-sm)]">{category}</span>
        </div>

        {/* Image nav dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === currentIndex ? 18 : 6,
                  backgroundColor: i === currentIndex ? "#facc15" : "rgba(255,255,255,0.7)",
                }}
                className="h-1.5 rounded-full shadow-sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-extrabold text-[var(--foreground)] leading-snug mb-2">
          {title}
        </h3>

        <p className={`text-[var(--muted)] text-sm leading-relaxed font-medium mb-1 ${expanded ? "" : "line-clamp-3"}`}>
          {description}
        </p>
        {description.length > 120 && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className="text-[#92700c] text-xs font-extrabold mb-3 hover:opacity-70 transition-opacity self-start"
          >
            {expanded ? "Show less ↑" : "Read more ↓"}
          </button>
        )}

        {/* Tools */}
        {tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5 mt-1">
            {tools.map((tool) => (
              <span
                key={tool}
                className="px-2.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[11px] font-bold text-[var(--muted)]"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-full text-xs font-extrabold text-[var(--foreground)] transition-all"
            >
              <FaGithub size={14} />
              <span>Source</span>
            </a>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-strong)] rounded-full text-xs font-extrabold text-[var(--accent-ink)] transition-all"
            >
              <FaExternalLinkAlt size={11} />
              <span>Live demo</span>
            </a>
          )}
          {!liveUrl && !githubUrl && (
            <div className="w-full text-center py-2.5 text-xs font-bold text-[var(--faint)]">
              Private repository
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
