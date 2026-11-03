import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";

// Destination email — who receives contact form submissions
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "toincial@gmail.com";

const LIMITS = { name: 120, email: 254, phone: 40, company: 160, message: 5000 };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lightweight in-memory rate limit (per server instance): 5 requests / 10 min / IP.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (now - times[times.length - 1] >= RATE_WINDOW_MS) hits.delete(key);
    }
  }
  return recent.length > RATE_MAX;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanField(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as Record<string, unknown>;
    const name = cleanField(body.name, LIMITS.name);
    const email = cleanField(body.email, LIMITS.email).toLowerCase();
    const message = cleanField(body.message, LIMITS.message);
    const phone = cleanField(body.phone, LIMITS.phone);
    const company = cleanField(body.company, LIMITS.company);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        message,
        phone: phone || null,
        company: company || null,
      },
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const row = (label: string, value: string, extra = "") =>
        `<tr>
          <td style="padding: 8px 0; color: #6b7280; width: 120px; vertical-align: top;">${label}</td>
          <td style="padding: 8px 0; color: #111; ${extra}">${value}</td>
        </tr>`;

      const safeEmail = escapeHtml(email);
      const { error: resendError } = await new Resend(apiKey).emails.send({
        from: "Incial Contact <onboarding@resend.dev>",
        to: TO_EMAIL,
        replyTo: email,
        subject: `New contact from ${name.replace(/[\r\n]+/g, " ")} — Incial`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #111; margin-bottom: 8px;">New Contact Form Submission</h2>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
            <table style="width: 100%; border-collapse: collapse;">
              ${row("Name", escapeHtml(name), "font-weight: 600;")}
              ${row("Email", `<a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a>`)}
              ${phone ? row("Phone", escapeHtml(phone)) : ""}
              ${company ? row("Company", escapeHtml(company)) : ""}
              ${row("Message", escapeHtml(message), "white-space: pre-wrap;")}
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 24px;" />
            <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
              Sent via Incial contact form at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
            </p>
          </div>
        `,
      });

      if (resendError) {
        // Log but don't fail — submission was already saved to DB
        console.error("Resend email error:", resendError);
      }
    } else {
      console.warn("RESEND_API_KEY is not set; skipping notification email.");
    }

    return NextResponse.json(
      { message: "Your message has been received. We'll get back to you soon!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process your message. Please try again." },
      { status: 500 }
    );
  }
}
