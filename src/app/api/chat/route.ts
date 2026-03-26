import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API Key not configured. Please add GROQ_API_KEY to your .env.local" },
        { status: 500 }
      );
    }

    // Fetch context data from Supabase
    const [{ data: profile }, { data: experience }, { data: certifications }, { data: projects }] = await Promise.all([
      supabase.from("profiles").select("*").limit(1).single(),
      supabase.from("experience").select("*").order("created_at", { ascending: false }),
      supabase.from("certifications").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false })
    ]);

    const chatMatch = profile?.bio?.match(/\[chat:(.*?)\]/);
    const customContext = chatMatch ? chatMatch[1] : "";

    const systemPrompt = `
      You are the AI assistant for ${profile?.full_name || "Paras Oli"}'s professional portfolio.
      
      CORE INFO:
      - Role: QA Automation Engineer (Full-stack)
      - Tech Stack: Playwright, Cypress, K6, GitHub Actions, Postman, Burp Suite, JavaScript/TypeScript.
      - Contact: ${process.env.NOTIFICATION_EMAIL || "parasoli7379@gmail.com"} or the contact page.
      
      CONTEXT:
      - Biography: ${profile?.bio?.replace(/\[.*?\]/g, "").trim() || "Expert in UI, API, and Security automation."}
      - Experience Summary: ${experience?.slice(0, 2).map((e: any) => `${e.role} at ${e.company}`).join(", ")}
      - Projects: ${projects?.slice(0, 3).map((p: any) => p.title).join(", ")}
      
      CUSTOM INSTRUCTIONS:
      ${customContext || "Be helpful and professional."}
      
      BEHAVIOR:
      - Be extremely concise. Give short, punchy answers.
      - Always encourage contacting via email (${process.env.NOTIFICATION_EMAIL || "parasoli7379@gmail.com"}) or the contact page for project inquiries.
      - If asked about a skill in the Tech Stack (like Playwright), confirm it's a core skill.
      - DO NOT use markdown bolding (e.g., no **text**). Use plain text only.
    `;

    // Map history to OpenAI format (supported by Groq)
    const groqMessages = [
      { role: "system", content: systemPrompt.trim() },
      ...messages.map((m: any) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content
      }))
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Using a stable, fast llama model
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Groq API Error Detail:", data.error);
      throw new Error(data.error.message || "Failed to fetch from Groq");
    }

    const text = data.choices[0].message.content;

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
