import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// Roughly classify the visitor's device from the User-Agent string.
function deviceFromUA(ua: string): string {
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(s)) return "Tablet";
  if (/mobi|iphone|android.*mobile|phone/.test(s)) return "Mobile";
  return "Desktop";
}

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json();
    if (!path || typeof path !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const h = await headers();
    // Vercel injects these geo headers at the edge; they're empty in local dev.
    const country = h.get("x-vercel-ip-country") || null;
    const city = decodeURIComponent(h.get("x-vercel-ip-city") || "") || null;
    const ua = h.get("user-agent") || "";

    // Anonymous, first-party visitor id used only to count unique visitors.
    const jar = await cookies();
    let visitorId = jar.get("pv_id")?.value;
    let isNewVisitor = false;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      isNewVisitor = true;
    }

    // Keep the referrer host only (drop query strings / our own origin).
    let ref: string | null = null;
    if (referrer && typeof referrer === "string") {
      try {
        const host = new URL(referrer).hostname;
        const self = h.get("host") || "";
        ref = host && !self.includes(host) ? host : null;
      } catch {
        ref = null;
      }
    }

    await supabase.from("page_views").insert([
      {
        path,
        referrer: ref,
        country,
        city,
        device: deviceFromUA(ua),
        visitor_id: visitorId,
      },
    ]);

    const res = NextResponse.json({ ok: true });
    if (isNewVisitor) {
      res.cookies.set("pv_id", visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
