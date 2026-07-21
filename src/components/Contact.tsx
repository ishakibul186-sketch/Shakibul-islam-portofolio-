import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Facebook, Github, Linkedin, Mail, MapPin, Phone, Twitter, CheckCircle2, Loader2 } from "lucide-react";

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Save details for popup display
        setSentDetails({ name, email, subject, message });
        
        // Reset form inputs (all text disappears and becomes empty again)
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });

        // Show success modal
        setShowModal(true);
      } else {
        setErrorMsg(result.error || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg("Failed to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative bg-white/[0.02]">
      <div className="container px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">Get In <span className="text-gradient">Touch</span></h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-display font-semibold mb-6">Let's talk about your project</h3>
            <p className="text-white/60 mb-8 leading-relaxed">
              Feel free to reach out for collaborations, freelance projects, or just to say hi. I'm always open to discussing new ideas and opportunities.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-purple-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm text-white/50">Email</p>
                  <p className="font-medium">contact@prohor.dev</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-cyan-400">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm text-white/50">Phone</p>
                  <p className="font-medium">+1 (234) 567-890</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-pink-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm text-white/50">Location</p>
                  <p className="font-medium">Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {[Github, Linkedin, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Your Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors text-white placeholder:text-white/30"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Your Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors text-white placeholder:text-white/30"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors text-white placeholder:text-white/30"
                  placeholder="Project Inquiry"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Message</label>
                <textarea 
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors text-white placeholder:text-white/30 resize-none"
                  placeholder="Hello, I'd like to talk about..."
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 font-medium text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-lg w-full p-8 relative overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>
                
                <h3 className="text-2xl font-display font-semibold text-white mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="text-white/60 text-sm mb-6">
                  Thank you for getting in touch. I will reply to your email as soon as possible.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 text-left mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400">Sent Details:</h4>
                <div className="text-sm text-white/80 space-y-2">
                  <p><span className="text-white/50">Name:</span> {sentDetails.name}</p>
                  <p><span className="text-white/50">Email:</span> {sentDetails.email}</p>
                  <p><span className="text-white/50">Subject:</span> {sentDetails.subject}</p>
                  <div className="mt-2 border-t border-white/10 pt-2">
                    <p className="text-white/50 mb-1">Message:</p>
                    <p className="text-white/70 italic text-xs leading-relaxed whitespace-pre-wrap">{sentDetails.message}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 font-medium text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all cursor-pointer"
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
