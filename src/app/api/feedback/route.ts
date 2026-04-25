import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, email, category, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "The Source <onboarding@resend.dev>",
      to: "sayhi.source@gmail.com",
      subject: `[${category || "General feedback"}] Feedback from ${name || "Anonymous"}`,
      text: `Category: ${category || "General feedback"}
Name: ${name || "Not provided"}
Email: ${email || "Not provided"}

Message:
${message}`.trim(),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message || "Failed to send feedback." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback send error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to send feedback." }, { status: 500 });
  }
}
