import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, category, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "SORCE Feedback <feedback@sorce.info>",
      to: "sayhi.source@gmail.com",
      subject: `[${category || "General feedback"}] Feedback from ${name || "Anonymous"}`,
      text: `Category: ${category || "General feedback"}
Name: ${name || "Not provided"}
Email: ${email || "Not provided"}

Message:
${message}`.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback send error:", err);
    return NextResponse.json({ error: "Failed to send feedback." }, { status: 500 });
  }
}
