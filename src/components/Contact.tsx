import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Facebook, Github, Linkedin, Mail, MapPin, Twitter, CheckCircle2, Loader2 } from "lucide-react";
import { submitContactMessage } from "../lib/contactUtils";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sentDetails, setSentDetails] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const { name, email, subject, message } = formData;
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const dbResult = await submitContactMessage(formData);

      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } catch (e) {
        console.warn("Server email dispatch notice:", e);
      }

      if (dbResult.success) {
        setSentDetails({ name, email, subject, message });
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setShowModal(true);
      } else {
        setErrorMsg("Failed to save message. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg("Failed to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-zinc-50/60">
      <div className="container px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease }}
          className="mb-14"
        >
          <p className="text-xs font-semibold text-blue-600 tracking-wide mb-2">
            07. Contact
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-zinc-950">
            Get In Touch
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Details */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease }}
            className="lg:col-span-5"
          >
            <h3 className="text-2xl font-display font-bold text-zinc-950 mb-4">
              Let&apos;s talk about your project
            </h3>
            <p className="text-zinc-600 mb-8 leading-relaxed text-base">
              Reach out for full-stack collaborations, consulting, or engineering opportunities. I respond promptly to all inquiries.
            </p>

            <div className="space-y-5 mb-8 border-t border-zinc-200 pt-6">
              <a
                href="mailto:ishakibul186@gmail.com"
                className="flex items-center gap-4 group"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 group-hover:border-blue-600 group-hover:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Email</p>
                  <p className="font-semibold text-sm text-zinc-950 group-hover:text-blue-600 transition-colors">
                    ishakibul186@gmail.com
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Location</p>
                  <p className="font-semibold text-sm text-zinc-950">Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              {[
                { icon: Github, href: "https://github.com/ishakibul186-sketch", label: "GitHub" },
                { icon: Facebook, href: "https://www.facebook.com/prohor245", label: "Facebook" },
                { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:border-zinc-300 transition-colors"
                >
                  <item.icon size={17} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right Form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 md:p-10"
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-xs font-semibold text-zinc-700">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition-colors text-sm text-zinc-950 placeholder:text-zinc-400"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-semibold text-zinc-700">
                    Your Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition-colors text-sm text-zinc-950 placeholder:text-zinc-400"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-subject" className="text-xs font-semibold text-zinc-700">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition-colors text-sm text-zinc-950 placeholder:text-zinc-400"
                  placeholder="Project Inquiry"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-semibold text-zinc-700">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition-colors text-sm text-zinc-950 placeholder:text-zinc-400 resize-none"
                  placeholder="Tell me about your timeline, scope, and goals..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-sm font-semibold text-white bg-zinc-950 hover:bg-blue-600 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease }}
              className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-200">
                  <CheckCircle2 size={28} />
                </div>

                <h3 className="text-xl font-display font-bold text-zinc-950 mb-1.5">
                  Message Sent Successfully
                </h3>
                <p className="text-zinc-600 text-sm mb-6">
                  Thank you for reaching out. I will reply to your email shortly.
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2.5 text-left mb-6">
                <p className="text-xs font-semibold text-zinc-500">Sent Details</p>
                <div className="text-sm text-zinc-700 space-y-1.5">
                  <p><span className="text-zinc-500">Name:</span> {sentDetails.name}</p>
                  <p><span className="text-zinc-500">Email:</span> {sentDetails.email}</p>
                  <p><span className="text-zinc-500">Subject:</span> {sentDetails.subject}</p>
                  <div className="mt-2 border-t border-zinc-200 pt-2">
                    <p className="text-zinc-500 text-xs mb-1">Message:</p>
                    <p className="text-zinc-700 text-xs leading-relaxed whitespace-pre-wrap">
                      {sentDetails.message}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 text-sm font-semibold text-white bg-zinc-950 hover:bg-blue-600 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
