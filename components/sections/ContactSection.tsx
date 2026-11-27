"use client";

import { useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import Footer from "@/components/layout/Footer";
import { useViewProgress } from "@/lib/useViewProgress";

/** Contact form and footer; the last section of the home page's single scroll. */
export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const rise = useViewProgress(sectionRef);
  // the heading and the form travel different distances as the section rises: a parallax arrival
  const headingY = useTransform(rise, (p) => (1 - p) * 110);
  const headingOpacity = useTransform(rise, [0.15, 0.7], [0, 1]);
  const formY = useTransform(rise, (p) => (1 - p) * 240);
  const formOpacity = useTransform(rise, [0.25, 0.85], [0, 1]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage(
        "Please fill in required fields: Name, Email, and Message.",
      );
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });

      // Reset status after a few seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error: unknown) {
      console.error("Form submission error:", error);
      setErrorMessage(error instanceof Error && error.message ? error.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="min-h-screen w-full bg-stage text-stage-ink flex flex-col justify-between pt-16 pb-6 px-4 md:pt-24 md:pb-8 md:px-0 relative overflow-hidden"
    >
      <div className="layout-content grow flex flex-col justify-center items-center max-w-2xl w-full mx-auto z-10">
        <motion.div
          style={{ y: headingY, opacity: headingOpacity }}
          className="text-center mb-8 md:mb-12 px-2 md:px-0"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight">
            Have a question? Need a quote?
          </h2>
          <p className="text-base md:text-lg text-stage-ink/55">
            We promise to reply within 24 hours, every time.
          </p>
        </motion.div>

        <motion.form
          style={{ y: formY, opacity: formOpacity }}
          onSubmit={handleSubmit}
          className="w-full space-y-4 md:space-y-6"
        >
          {/* Name Field */}
          <div className="bg-stage-ink/5 border border-stage-ink/10 rounded-full px-5 py-3 md:px-6 md:py-3">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-stage-ink placeholder-gray-500 text-sm md:text-base"
            />
          </div>

          {/* Email Field */}
          <div className="bg-stage-ink/5 border border-stage-ink/10 rounded-full px-5 py-3 md:px-6 md:py-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-stage-ink placeholder-gray-500 text-sm md:text-base"
            />
          </div>

          {/* Phone Field */}
          <div className="bg-stage-ink/5 border border-stage-ink/10 rounded-full px-5 py-3 md:px-6 md:py-3">
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-stage-ink placeholder-gray-500 text-sm md:text-base"
            />
          </div>

          {/* Message Field */}
          <div className="bg-stage-ink/5 border border-stage-ink/10 rounded-3xl px-5 py-4 md:px-6 md:py-4 relative">
            <textarea
              name="message"
              placeholder="Message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-stage-ink placeholder-gray-500 resize-none mb-12 text-sm md:text-base"
            />

            {status === "success" && (
              <p className="absolute bottom-4 left-5 md:left-6 text-green-400 text-xs md:text-sm">
                Message sent successfully!
              </p>
            )}
            {status === "error" && (
              <p
                className="absolute bottom-4 left-5 md:left-6 text-red-500 text-xs md:text-sm max-w-[60%] md:max-w-[70%] line-clamp-2"
                title={errorMessage}
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="absolute bottom-4 right-4 bg-stage-ink text-stage font-bold py-2 px-5 md:px-6 text-sm md:text-base rounded-full hover:opacity-85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Sending..." : "Contact"}
            </button>
          </div>
        </motion.form>
      </div>

      <Footer />
    </section>
  );
}