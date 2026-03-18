import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} QA Portfolio. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-muted">
          <Link href="https://github.com" target="_blank" className="hover:text-white transition-colors">
            <FaGithub size={20} />
          </Link>
          <Link href="https://linkedin.com" target="_blank" className="hover:text-white transition-colors">
            <FaLinkedin size={20} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
