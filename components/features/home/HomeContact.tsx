"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/layout/Footer";
import { useSectionsConfig } from "@/lib/useSectionsConfig";
import { CONTACT } from "./homeData";

const HOME_INK = "#0b1640";

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "sent" | "error";

/** Fixed specks of light across the sky (positions in %, so they never move between renders). */
const SPECKS = [
  [8, 14], [17, 32], [26, 9], [34, 46], [43, 21], [52, 38], [61, 12], [69, 29], [77, 8], [86, 41], [93, 19],
  [12, 58], [22, 71], [38, 63], [57, 55], [72, 66], [88, 60], [4, 36], [47, 4], [81, 52],
] as const;

const fieldClass =
  "w-full rounded-2xl border border-[#0b1640]/10 bg-[#f4f7fc] px-4 py-3.5 text-[0.95rem] text-[#0b1640] outline-none transition-colors placeholder:text-[#0b1640]/40 focus:border-[#1463ff] focus:bg-white";

/** The enquiry form: name, email, phone and message, sent to /api/contact. */
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const update = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const email = form.email.trim();
    if (!form.name.trim() || !form.message.trim() || (!email && !form.phone.trim())) {
      setError("Please add your name, a message, and an email or phone number.");
      setStatus("error");
      return;
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      setError("That email address doesn't look right.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email, phone: form.phone.trim(), message: form.message.trim() }),
      });
      const data: { error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex min-h-[18rem] flex-col items-center justify-center text-center">
        <p className="text-2xl font-semibold tracking-[-0.03em]">Thank you. We&apos;ll be in touch within a day.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-5 text-sm font-medium underline underline-offset-4">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="sr-only">Your name</span>
        <input className={fieldClass} placeholder="Your name" autoComplete="name" value={form.name} onChange={update("name")} maxLength={120} />
      </label>
      <label>
        <span className="sr-only">Email</span>
        <input className={fieldClass} type="email" placeholder="Email" autoComplete="email" value={form.email} onChange={update("email")} maxLength={200} />
      </label>
      <label>
        <span className="sr-only">Phone</span>
        <input className={fieldClass} type="tel" placeholder="Phone" autoComplete="tel" value={form.phone} onChange={update("phone")} maxLength={30} />
      </label>
      <label className="sm:col-span-2">
        <span className="sr-only">What are you building?</span>
        <textarea className={`${fieldClass} min-h-[7.5rem] resize-none`} placeholder="What are you building?" value={form.message} onChange={update("message")} maxLength={5000} />
      </label>
      <div className="flex flex-col-reverse items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="text-sm text-red-600">
          {status === "error" ? error : ""}
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1463ff]"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

/**
 * Contact: a rounded black-and-gray textured gradient card with faint specks of light and a big
 * white line, the ways to reach us as pills, and the form on a white card rising from the bottom.
 * Then the footer.
 */
export default function HomeContact() {
  const sectionsConfig = useSectionsConfig();
  const hasCurvedAbove =
    sectionsConfig["trust"] !== false || sectionsConfig["client-testimonials"] !== false;

  return (
    <section
      data-tone="light"
      className={`stage-light relative z-10 bg-white px-3 pb-6 sm:px-4 ${
        hasCurvedAbove ? "-mt-[min(14dvh,16vw)] pt-[calc(min(14dvh,16vw)+0.75rem)]" : "pt-3"
      }`}
      style={{ color: HOME_INK }}
    >
      <div
        id="contact"
        className="relative scroll-mt-4 overflow-hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.12)_0%,transparent_58%),linear-gradient(180deg,#08090b_0%,#1c1e24_48%,#3f434d_100%)] px-5 pt-[clamp(6rem,12vw,9rem)] md:rounded-[2.75rem]"
      >
        {/* Subtle fine grain texture over the black-and-gray gradient */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09] mix-blend-overlay"
        >
          <filter id="contact-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#contact-grain)" />
        </svg>

        {SPECKS.map(([left, top]) => (
          <span key={`${left}-${top}`} aria-hidden className="absolute h-[3px] w-[3px] rounded-full bg-white/45" style={{ left: `${left}%`, top: `${top}%` }} />
        ))}

        <div className="relative mx-auto max-w-4xl text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-[clamp(2.8rem,1.4rem+5.6vw,6.75rem)] font-semibold leading-[0.95] tracking-[-0.055em] [text-shadow:0_2px_30px_rgba(0,0,0,0.45)]"
          >
            Let&apos;s build what&apos;s next.
          </motion.h2>
          <p className="mx-auto mt-5 max-w-[34rem] text-[clamp(1rem,0.94rem+0.3vw,1.2rem)] text-white/85">
            Tell us what you&apos;re working on. <span className="font-semibold text-white">We reply within 24 hours</span>, every time.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <a href={`mailto:${CONTACT.email}`} className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[#0b1640] transition-transform hover:-translate-y-0.5">
              {CONTACT.email}
            </a>
            <a href={CONTACT.phoneHref} className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[#0b1640] transition-transform hover:-translate-y-0.5">
              {CONTACT.phone}
            </a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20">
              WhatsApp us
            </a>
          </div>
        </div>

        {/* the form rises out of the bottom of the dark gradient */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-5%" }}
          transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          className="relative mx-auto mt-[clamp(3rem,6vw,4.5rem)] max-w-[44rem] rounded-t-[1.75rem] bg-white p-5 pb-8 shadow-[0_-20px_60px_-30px_rgba(0,0,0,0.75)] md:p-8 md:pb-10"
        >
          <ContactForm />
        </motion.div>
      </div>

      <div className="mt-6">
        <Footer />
      </div>
    </section>
  );
}
