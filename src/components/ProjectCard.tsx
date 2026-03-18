"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

interface ProjectCardProps {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
}

export default function ProjectCard({
  title,
  description,
  category,
  imageUrl,
  githubUrl,
  liveUrl,
}: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ 
        rotateY: 10, 
        rotateX: -5,
        y: -12,
        z: 50
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ transformStyle: "preserve-3d" }}
      className="glass rounded-[32px] overflow-hidden group flex flex-col h-full border-white/5 hover:border-[var(--neon-cyan)]/40 transition-all duration-500 glass-glow"
    >
      <div className="scanner-line opacity-10" />
      <div className="relative w-full aspect-[16/10] bg-white/[0.02] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10 italic font-light">
            Working on visual...
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="mb-4">
          <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase mb-3 block">
            {category}
          </span>
          <h3 className="text-2xl font-semibold tracking-tight text-white mb-3">
            {title}
          </h3>
          <p className="text-white/50 text-sm leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        <div className="mt-auto pt-6 flex gap-3">
          {githubUrl && (
            <Link
              href={githubUrl}
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-xs font-medium transition-all"
            >
              <FaGithub size={16} /> Code
            </Link>
          )}
          {liveUrl && (
            <Link
              href={liveUrl}
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black hover:bg-white/90 rounded-2xl text-xs font-bold transition-all"
            >
              <FaExternalLinkAlt size={14} /> Live Demo
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
