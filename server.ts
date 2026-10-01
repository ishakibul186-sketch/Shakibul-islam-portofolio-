import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { injectDynamicSeo } from "./src/server/seoInjector";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API endpoint for contact form
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validate request
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address format" });
    }

    // Retrieve and validate credentials
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.error("Missing email credentials in server configuration.");
      return res.status(500).json({
        error: "Server email configuration is missing. Please set GMAIL_USER and GMAIL_APP_PASSWORD in your Secrets/Environment variables.",
      });
    }

    try {
      // Configure transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      // Prepare mail options
      const mailOptions = {
        from: `"${name}" <${gmailUser}>`, // Send as GMAIL_USER with user's name
        to: gmailUser, // Send to yourself
        replyTo: email, // Reply-to the user's actual email
        subject: `[Portfolio Contact] ${subject}`,
        text: `You received a new message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #7000FF; border-bottom: 2px solid #7000FF; padding-bottom: 10px;">New Portfolio Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #00C2FF; margin-top: 20px; border-radius: 4px;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>`,
      };

      // Send the mail
      await transporter.sendMail(mailOptions);

      return res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error: any) {
      console.error("Nodemailer error:", error);
      return res.status(500).json({
        error: "Failed to send email. Please check your credentials and try again.",
        details: error.message,
      });
    }
  });

  // API endpoint for admin replying to contact message
  app.post("/api/reply-message", async (req, res) => {
    const { to, recipientName, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Recipient email, subject, and message content are required" });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.warn("GMAIL credentials missing in environment. Simulating reply dispatch.");
      return res.status(200).json({
        success: true,
        simulated: true,
        message: "Email reply queued and saved (SMTP credentials not configured in secrets).",
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const mailOptions = {
        from: `"Shakibul Islam Prohor" <${gmailUser}>`,
        to: to,
        subject: subject,
        text: text || "Please view this email in an HTML-compatible email client.",
        html: html,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: true, message: `Email reply sent to ${to}` });
    } catch (error: any) {
      console.error("Error sending reply email:", error);
      return res.status(500).json({
        error: "Failed to send email via SMTP",
        details: error.message,
      });
    }
  });

  // API endpoint for broadcasting emails to multiple recipients
  app.post("/api/send-broadcast", async (req, res) => {
    const { recipients, subject, html, text } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0 || !subject || !html) {
      return res.status(400).json({ error: "Recipients list, subject, and HTML content are required" });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.warn("GMAIL credentials missing in environment. Simulating broadcast dispatch.");
      return res.status(200).json({
        success: true,
        simulated: true,
        count: recipients.length,
        message: `Broadcast saved and queued for ${recipients.length} recipients.`,
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      // Send mail in batch (using BCC or individual)
      const mailOptions = {
        from: `"Shakibul Islam Prohor" <${gmailUser}>`,
        to: gmailUser,
        bcc: recipients,
        subject: subject,
        text: text || "Please view this email in an HTML-compatible email client.",
        html: html,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({
        success: true,
        count: recipients.length,
        message: `Broadcast dispatched successfully to ${recipients.length} recipients`,
      });
    } catch (error: any) {
      console.error("Error sending broadcast email:", error);
      return res.status(500).json({
        error: "Failed to dispatch broadcast emails via SMTP",
        details: error.message,
      });
    }
  });

  // Serve static about.html for /about URL (for SEO crawlers and direct visits)
  app.get(["/about", "/about/"], (req, res) => {
    const filePath =
      process.env.NODE_ENV !== "production"
        ? path.join(process.cwd(), "about.html")
        : path.join(process.cwd(), "dist", "about.html");
    res.sendFile(filePath);
  });

  // Vite middleware for development / Static files for production with Dynamic SEO Injection
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Handle dynamic SEO routes in development before Vite SPA fallback
    const handleSeoRouteDev = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const indexPath = path.join(process.cwd(), "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const html = await injectDynamicSeo(template, req.path, req.params);
        res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(html);
      } catch (err) {
        console.error("Error in development SSR SEO handler:", err);
        next(err);
      }
    };

    // ONLY specific project details and specific article/blog details are server-side rendered
    app.get(["/my-projects/:id", "/my-projects/:id/", "/projects/:id", "/projects/:id/"], handleSeoRouteDev);
    app.get(["/articles/:id", "/articles/:id/", "/blog/:id", "/blog/:id/"], handleSeoRouteDev);

    // All other routes (index, contact, skills, my-projects list, blog list, admin) use standard client-side routing
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    // Serve static build assets (JS, CSS, images, etc.) without automatic index.html fallback
    app.use(express.static(distPath, { index: false }));

    // Handle dynamic SEO routes in production for specific projects and specific articles only
    const handleSeoRouteProd = async (req: express.Request, res: express.Response) => {
      try {
        const indexPath = path.join(distPath, "index.html");
        const template = fs.readFileSync(indexPath, "utf-8");
        const html = await injectDynamicSeo(template, req.path, req.params);
        res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(html);
      } catch (err) {
        console.error("Error in production SSR SEO handler:", err);
        res.sendFile(path.join(distPath, "index.html"));
      }
    };

    app.get(["/my-projects/:id", "/my-projects/:id/", "/projects/:id", "/projects/:id/"], handleSeoRouteProd);
    app.get(["/articles/:id", "/articles/:id/", "/blog/:id", "/blog/:id/"], handleSeoRouteProd);

    // Fallback for all other routes (Home, Contact, Skills, Admin, etc.) - pure client-side SPA routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});

