import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, service, budget, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const db = await getMongoDb();
    const result = await db.collection("Contact Us").insertOne({
      name,
      email,
      company: company || null,
      service: service || null,
      budget: budget || null,
      message,
      created_at: new Date().toISOString(),
      status: "new",
    });

    if (!result.acknowledged) {
      console.error("MongoDB insert error");
      return NextResponse.json(
        { error: "Failed to save your message. Please try again." },
        { status: 500 }
      );
    }

    // Send email notification (non-blocking — form still succeeds even if email fails)
    try {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: "CognitoByte <onboarding@resend.dev>",
          to: "automations@cognitobyte.com",
          replyTo: email,
          subject: `New contact form submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || "N/A"}</p>
            <p><strong>Service:</strong> ${service || "N/A"}</p>
            <p><strong>Budget:</strong> ${budget || "N/A"}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        });
      }
    } catch (emailError) {
      console.error("Resend email error:", emailError);
      // Don't fail the request — the submission is already saved in MongoDB
    }

    return NextResponse.json({ success: true, message: "Your message has been received!" });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
