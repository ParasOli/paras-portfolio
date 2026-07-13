import Link from "next/link";

/**
 * Friendly rounded monogram — a warm yellow tile with initials.
 * Used by Navbar + SplashScreen + Footer + login + admin.
 */
export default function Logo({
  size = 40,
  withWordmark = false,
  href,
  className = "",
}: {
  size?: number;
  withWordmark?: boolean;
  href?: string;
  className?: string;
}) {
  const mark = (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="relative inline-flex items-center justify-center rounded-2xl bg-[var(--accent)] font-extrabold text-[var(--accent-ink)] shadow-[0_2px_0_0_var(--accent-strong)]"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        PO
      </span>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-tight text-[var(--foreground)]">
            Paras Oli
          </span>
          <span className="text-[11px] font-bold text-[var(--faint)]">
            Full-Stack Test Engineer
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={`inline-flex ${className}`} aria-label="Home">
        {mark}
      </Link>
    );
  }

  return <span className={`inline-flex ${className}`}>{mark}</span>;
}
