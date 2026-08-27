import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

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
        text: `You received a new message from your portfolio contact form:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}`,
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

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("/my-projects", (req, res) => {
      res.sendFile(path.join(distPath, "index-projects.html"));
    });
    app.get("/about", (req, res) => {
      res.sendFile(path.join(distPath, "index-about.html"));
    });
    app.get("/skills", (req, res) => {
      res.sendFile(path.join(distPath, "index-skills.html"));
    });
    app.get("/blog", (req, res) => {
      res.sendFile(path.join(distPath, "index-blog.html"));
    });
    app.get("/contact", (req, res) => {
      res.sendFile(path.join(distPath, "index-contact.html"));
    });
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
