"use client";

import { useEffect } from "react";
import { useProfile } from "@/context/ProfileContext";
import { usePathname } from "next/navigation";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import VisitTracker from "@/components/VisitTracker";

// Marketing/analytics params we strip from the address bar for a clean, pro URL.
const TRACKING_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id",
  "fbclid", "gclid", "gbraid", "wbraid", "dclid", "msclkid", "twclid", "ttclid",
  "igshid", "igsh", "mc_eid", "mc_cid", "_hsenc", "_hsmi", "vero_id", "yclid",
];

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useProfile();
  const pathname = usePathname();

  // Strip tracking params (utm_*, fbclid, …) from the URL after load so the
  // address bar shows a clean https://parasoli.me/ — keeps any real params.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    let changed = false;
    TRACKING_PARAMS.forEach((p) => {
      if (url.searchParams.has(p)) {
        url.searchParams.delete(p);
        changed = true;
      }
    });
    if (changed) {
      const query = url.searchParams.toString();
      window.history.replaceState({}, "", url.pathname + (query ? `?${query}` : "") + url.hash);
    }
  }, [pathname]);

  // Admin / login run bare — no public chrome or splash.
  const isBare = pathname?.startsWith("/admin") || pathname?.startsWith("/login");
  if (isBare) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <VisitTracker />
      <ScrollProgressBar />
      <SplashScreen isVisible={isLoading} />
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

