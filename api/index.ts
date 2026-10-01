import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { injectDynamicSeo } from "../src/server/seoInjector";

dotenv.config();

/**
 * Robust helper to locate index.html template across local and Vercel serverless environments
 */
function getTemplateHtml(): string {
  const possiblePaths = [
    path.join(process.cwd(), "dist", "index.html"),
    path.join(process.cwd(), "index.html"),
    path.resolve(__dirname, "../dist/index.html"),
    path.resolve(__dirname, "../../dist/index.html"),
    path.resolve(__dirname, "dist/index.html"),
    path.resolve(__dirname, "index.html"),
    path.resolve(__dirname, "../index.html"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, "utf-8");
    }
  }
  return "";
}

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(req: any, res: any) {
  const url = req.url || "";
  const method = req.method || "GET";

  // 1. API: Contact Form Submission
  if (method === "POST" && (url.includes("/api/contact") || url === "/contact")) {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address format" });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      return res.status(500).json({
        error: "Server email configuration is missing.",
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });

      await transporter.sendMail({
        from: `"${name}" <${gmailUser}>`,
        to: gmailUser,
        replyTo: email,
        subject: `[Portfolio Contact] ${subject}`,
        text: `From: ${name} (${email})\nSubject: ${subject}\n\n${message}`,
        html: `<div><h2>New Portfolio Message</h2><p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p>${message}</p></div>`,
      });

      return res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to send email", details: err.message });
    }
  }

  // 2. API: Reply to Message
  if (method === "POST" && url.includes("/api/reply-message")) {
    const { to, subject, html, text } = req.body || {};
    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Recipient email, subject, and HTML are required" });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      return res.status(200).json({ success: true, simulated: true, message: "Email queued." });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });

      await transporter.sendMail({
        from: `"Shakibul Islam Prohor" <${gmailUser}>`,
        to,
        subject,
        text: text || "View in HTML client",
        html,
      });

      return res.status(200).json({ success: true, message: `Email reply sent to ${to}` });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to send email", details: err.message });
    }
  }

  // 3. API: Send Broadcast
  if (method === "POST" && url.includes("/api/send-broadcast")) {
    const { recipients, subject, html, text } = req.body || {};
    if (!Array.isArray(recipients) || recipients.length === 0 || !subject || !html) {
      return res.status(400).json({ error: "Recipients, subject, and HTML are required" });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      return res.status(200).json({ success: true, simulated: true, count: recipients.length });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });

      await transporter.sendMail({
        from: `"Shakibul Islam Prohor" <${gmailUser}>`,
        to: gmailUser,
        bcc: recipients,
        subject,
        text: text || "View in HTML client",
        html,
      });

      return res.status(200).json({ success: true, count: recipients.length });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to dispatch broadcast", details: err.message });
    }
  }

  // 4. Handle GET / HEAD Requests for Web Pages with Dynamic Server-Side SEO
  if (method === "GET" || method === "HEAD") {
    // Resolve the clean original request path passed from Vercel rewrites or headers
    const requestedPath = 
      (req.query?.route as string) || 
      (req.headers["x-forwarded-uri"] as string) || 
      (req.headers["x-matched-path"] as string) || 
      (url ? url.split("?")[0] : "/");

    // Serve static about.html if requested
    if (requestedPath === "/about" || requestedPath === "/about/") {
      const aboutPaths = [
        path.join(process.cwd(), "about.html"),
        path.join(process.cwd(), "dist", "about.html"),
        path.resolve(__dirname, "../about.html"),
      ];
      for (const ap of aboutPaths) {
        if (fs.existsSync(ap)) {
          const content = fs.readFileSync(ap, "utf-8");
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.status(200).send(content);
        }
      }
    }

    try {
      let template = getTemplateHtml();
      if (!template) {
        template = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
      }

      const html = await injectDynamicSeo(template, requestedPath);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    } catch (err: any) {
      console.error("[Vercel SSR] Error injecting dynamic SEO:", err);
      const fallback = getTemplateHtml();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(fallback || "<!doctype html><html><body>Error loading page</body></html>");
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
