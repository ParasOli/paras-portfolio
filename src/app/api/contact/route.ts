import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

// ---- In-memory IP rate limiter (per warm server instance) ----
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // opportunistic cleanup so the map can't grow unbounded
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

function getIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const message = (body.message || '').toString().trim();

    // ---- Validation ----
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
    }
    if (name.length > 100 || email.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: 'One of the fields is too long.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // ---- Rate limit by IP ----
    const ip = getIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many messages from your connection. Please try again in a few minutes.' },
        { status: 429 },
      );
    }

    // ---- Persist the message (server-side so it can't bypass the limiter) ----
    const { error: insertError } = await supabase
      .from('messages')
      .insert([{ name, email, message }]);
    if (insertError) {
      return NextResponse.json({ error: 'Could not save your message. Please try again.' }, { status: 500 });
    }

    // ---- Fire off the email notification (non-fatal if it fails) ----
    if (process.env.RESEND_API_KEY) {
      try {
        const { error } = await resend.emails.send({
          from: 'Portfolio <onboarding@resend.dev>',
          to: process.env.NOTIFICATION_EMAIL || 'parasoli7@gmail.com',
          subject: `New message from ${name}`,
          replyTo: email,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });
        if (error) console.error('Resend error:', error);
      } catch (err) {
        console.error('Email notification failed:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
