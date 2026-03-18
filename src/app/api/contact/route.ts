import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: process.env.NOTIFICATION_EMAIL || 'parasoli7@gmail.com', // Using a more likely Gmail or env var
      subject: `New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    console.log("Resend API Attempt:", { success: !error, error });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
