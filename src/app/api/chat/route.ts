import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key not configured. Please add GEMINI_API_KEY to your .env.local" },
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
    });

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

    const lastMessage = messages[messages.length - 1].content;
    const history = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I am now configured as your professional portfolio assistant. I will respond briefly and accurately based on your CV data." }] },
      ...messages.slice(0, -1).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }))
    ];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
