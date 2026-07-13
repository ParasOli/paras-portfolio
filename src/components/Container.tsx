import { ReactNode } from "react";

/**
 * The single page-width shell used across every route + the footer.
 * One width (max-w-6xl) and consistent horizontal padding site-wide.
 */
export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full max-w-6xl mx-auto px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}
