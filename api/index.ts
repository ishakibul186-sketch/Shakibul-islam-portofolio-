import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { injectDynamicSeo } from "../src/server/seoInjector";
import { EMBEDDED_INDEX_HTML } from "./embeddedTemplate";

dotenv.config();

// ESM-compatible __dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Robust helper to locate index.html template across local and Vercel serverless environments.
 * Falls back to bundled EMBEDDED_INDEX_HTML so it NEVER crashes or throws 500.
 */
function getTemplateHtml(): string {
  const candidates: string[] = [];

  try {
    candidates.push(path.join(process.cwd(), "dist", "index.html"));
    candidates.push(path.join(process.cwd(), "index.html"));
  } catch {}

  try {
    candidates.push(path.resolve(__dirname, "../dist/index.html"));
    candidates.push(path.resolve(__dirname, "../../dist/index.html"));
    candidates.push(path.resolve(__dirname, "dist/index.html"));
    candidates.push(path.resolve(__dirname, "index.html"));
    candidates.push(path.resolve(__dirname, "../index.html"));
  } catch {}

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        if (content && content.length > 100) {
          return content;
        }
      }
    } catch {}
  }

  // Guaranteed fallback to pre-compiled embedded HTML template
  return EMBEDDED_INDEX_HTML;
}

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(req: any, res: any) {
  const url = req.url || "";
  const method = req.method || "GET";

  // Target path for API calls considering rewrites and proxy headers
  const targetApiPath = 
    (req.headers["x-forwarded-uri"] as string) || 
    (req.headers["x-matched-path"] as string) || 
    url;

  // 1. API: Contact Form Submission
  if (method === "POST" && (targetApiPath.includes("/api/contact") || targetApiPath === "/contact")) {
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
  if (method === "POST" && targetApiPath.includes("/api/reply-message")) {
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
  if (method === "POST" && targetApiPath.includes("/api/send-broadcast")) {
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
    const queryRoute = (req.query?.route as string);
    const forwardedUri = (req.headers["x-forwarded-uri"] as string);
    const matchedPath = (req.headers["x-matched-path"] as string);
    const rawUrl = url ? url.split("?")[0] : "/";

    let requestedPath = "/";
    if (queryRoute && queryRoute !== "/api" && queryRoute !== "/api/index") {
      requestedPath = queryRoute;
    } else if (forwardedUri && !forwardedUri.startsWith("/api")) {
      requestedPath = forwardedUri.split("?")[0];
    } else if (matchedPath && !matchedPath.startsWith("/api")) {
      requestedPath = matchedPath.split("?")[0];
    } else if (rawUrl && !rawUrl.startsWith("/api")) {
      requestedPath = rawUrl;
    }

    // Serve static about.html if requested
    if (requestedPath === "/about" || requestedPath === "/about/") {
      const aboutPaths = [
        path.join(process.cwd(), "about.html"),
        path.join(process.cwd(), "dist", "about.html"),
        path.resolve(__dirname, "../about.html"),
        path.resolve(__dirname, "../../about.html"),
      ];
      for (const ap of aboutPaths) {
        try {
          if (fs.existsSync(ap)) {
            const content = fs.readFileSync(ap, "utf-8");
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.status(200).send(content);
          }
        } catch {}
      }
    }

    try {
      const template = getTemplateHtml();
      const html = await injectDynamicSeo(template, requestedPath);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    } catch (err: any) {
      console.error("[Vercel SSR] Error injecting dynamic SEO:", err);
      const fallback = getTemplateHtml();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(fallback);
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
