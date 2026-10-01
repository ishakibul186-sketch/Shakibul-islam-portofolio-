# Shakibul Islam Prohor — Full Stack Portfolio & Engineering Platform

[![Website](https://img.shields.io/badge/Live_Site-shakibul--islam--portofolio.vercel.app-7000FF?style=for-the-badge&logo=vercel&logoColor=white)](https://shakibul-islam-portofolio.vercel.app/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.8-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase_12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

> **Official portfolio, technical showcase, and content management platform of Shakibul Islam Prohor** — Full Stack Developer & Software Engineer based in Dhaka, Bangladesh.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Interactive Portfolio Single-Page Application](#1-interactive-portfolio-single-page-application)
  - [Projects Showcase (`/my-projects`)](#2-projects-showcase-my-projects)
  - [Technical Blog & Articles (`/blog` & `/articles/:id`)](#3-technical-blog--articles-blog--articlesid)
  - [Admin CMS Dashboard (`/admin`)](#4-admin-cms-dashboard-admin)
  - [Contact & Inquiry Engine](#5-contact--inquiry-engine)
  - [Advanced SEO & Search Engine Optimization](#6-advanced-seo--search-engine-optimization)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables Setup](#environment-variables-setup)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [SEO & Search Console Configuration](#seo--search-console-configuration)
- [Deployment](#deployment)
- [Author & Social Profiles](#author--social-profiles)
- [License](#license)

---

## Overview

This project is a modern, high-performance, full-stack personal portfolio and content platform. Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Motion**, **Firebase**, and **Express.js**, it serves as an interactive showcase of software engineering projects, technical tutorials, and professional background.

### Live URLs:
- **Production Website:** [https://shakibul-islam-portofolio.vercel.app](https://shakibul-islam-portofolio.vercel.app)
- **Projects Showcase:** [https://shakibul-islam-portofolio.vercel.app/my-projects](https://shakibul-islam-portofolio.vercel.app/my-projects)
- **About Me:** [https://shakibul-islam-portofolio.vercel.app/about](https://shakibul-islam-portofolio.vercel.app/about)
- **Technical Skills:** [https://shakibul-islam-portofolio.vercel.app/skills](https://shakibul-islam-portofolio.vercel.app/skills)
- **Blog & Tutorials:** [https://shakibul-islam-portofolio.vercel.app/blog](https://shakibul-islam-portofolio.vercel.app/blog)
- **Contact:** [https://shakibul-islam-portofolio.vercel.app/contact](https://shakibul-islam-portofolio.vercel.app/contact)

---

## Key Features

### 1. Interactive Portfolio Single-Page Application
- **Cyberpunk / Cosmic Theme:** Deep space dark background (`#030014`), neon gradients (purple, cyan, emerald), and responsive glassmorphic cards.
- **Fluid Micro-Animations:** Smooth section transitions, interactive floating elements, and hover dynamics powered by `motion/react`.
- **Responsive Layout:** Optimized from ultra-wide displays down to mobile screens with touch-friendly navigation.
- **Sections Included:** Hero with dynamic roles, About Me, Technical Skills Grid, Professional Experience, Services, Featured Projects, Latest Articles, and Direct Contact.

### 2. Projects Showcase (`/my-projects`)
- **Category Filtering:** Filter projects by *All*, *Full Stack*, *React / Next.js*, *Frontend*, *AI & ML*, or *Cloud / Backend*.
- **Search & Sort:** Live search by title, tech stack keywords, or descriptions.
- **Detailed Project Pages (`/my-projects/:id`):** Deep dives including architecture overviews, key challenges, technology badges, live preview links, and GitHub repository references.

### 3. Technical Blog & Articles (`/blog` & `/articles/:id`)
- **Markdown Rendering:** Full markdown support with syntax highlighting, lists, blockquotes, and tables via `react-markdown`.
- **Dynamic Meta & Reading Time:** Auto-calculated reading time, author metadata, publish date, and category tags.
- **Share & Engagement:** One-click sharing to Twitter/X, LinkedIn, Facebook, and direct clipboard copying.

### 4. Admin CMS Dashboard (`/admin`)
- **Secure Authentication:** Firebase Authentication protection with session persistence and custom route guards.
- **Project Manager:** Add, edit, delete, and feature projects in real-time.
- **Blog Publisher:** Rich markdown editor with live preview, category selectors, cover photo upload, and instant database synchronization.
- **Image Cropper & Uploader:** Built-in `react-easy-crop` modal for cropping and optimizing thumbnails before publishing.

### 5. Contact & Inquiry Engine
- **Full-Stack Express API:** `/api/contact` endpoint validates input and delivers formatted emails.
- **Nodemailer SMTP Integration:** Real-time email dispatch directly to `ishakibul186@gmail.com` with auto-reply-to configuration.
- **Form Validation & Feedback:** Instant toast feedback, input regex validation, and loading indicators.

### 6. Advanced SEO & Search Engine Optimization
- **Clean URLs:** Clean paths (`/my-projects`, `/about`, `/skills`, `/blog`, `/contact`) mapped seamlessly via React Router v7 and `vercel.json` rewrites.
- **Dynamic Head Metadata:** Managed per-page via `react-helmet-async` for titles, descriptions, canonical tags, and OpenGraph/Twitter social cards.
- **JSON-LD Schema Markup:** Structured data for `Person`, `WebSite`, `Blog`, `BlogPosting`, `AboutPage`, `ContactPage`, and `CollectionPage`.
- **Google Search Console Verification:** Automated verification via meta tag and standalone `googlead42dd66f9e0cb82.html` file.
- **Sitemap & Robots Directives:** Dynamic `sitemap.xml` with image metadata and a strict `robots.txt` configuration.

---

## Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5.8](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation:** [Motion](https://motion.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **SEO & Meta:** [React Helmet Async](https://github.com/staylor/react-helmet-async)
- **Markdown:** [React Markdown](https://github.com/remarkjs/react-markdown)

### Backend & Cloud
- **Server:** [Express.js](https://expressjs.com/) (Node.js runtime)
- **Database & Auth:** [Firebase Realtime Database](https://firebase.google.com/) / [Cloud Firestore](https://firebase.google.com/docs/firestore) & Firebase Auth
- **Email Service:** [Nodemailer](https://nodemailer.com/) (Gmail SMTP)
- **Development Tooling:** [TSX](https://github.com/privatenumber/tsx), [esbuild](https://esbuild.github.io/)
- **Hosting:** [Vercel](https://vercel.com/) / [Google Cloud Run](https://cloud.google.com/run)

---

## Project Architecture

```
├── .env.example               # Template for required environment variables
├── index.html                 # Main HTML entry point with SEO & verification tags
├── metadata.json              # Application metadata & platform configurations
├── package.json               # Project manifest & npm scripts
├── public/
│   ├── googlead42dd66f9e0cb82.html  # Google Search Console HTML verification
│   ├── prohor-v2.png          # Official profile avatar & social share image
│   ├── robots.txt             # Search crawler directives
│   └── sitemap.xml            # XML sitemap with images & clean routes
├── server.ts                  # Express backend & Nodemailer contact API
├── src/
│   ├── App.tsx                # Application routes, theme wrappers, & SEO managers
│   ├── main.tsx               # React application entry point
│   ├── index.css              # Global styles & Tailwind CSS v4 imports
│   ├── types/                 # TypeScript interfaces & types
│   ├── lib/                   # Utility helpers & Firebase initialization
│   ├── context/
│   │   └── AuthContext.tsx    # Firebase authentication context & state
│   ├── components/            # Reusable UI components
│   │   ├── About.tsx          # Biography & background section
│   │   ├── Blog.tsx           # Article listing component
│   │   ├── Contact.tsx        # Interactive contact form & social links
│   │   ├── Experience.tsx     # Career & development experience timeline
│   │   ├── Footer.tsx         # Site footer & copyright
│   │   ├── Hero.tsx           # Hero section with animated typography
│   │   ├── LoadingScreen.tsx  # Initial aesthetic loading animation
│   │   ├── Navbar.tsx         # Responsive top navigation & mobile menu
│   │   ├── Projects.tsx       # Featured project cards
│   │   ├── Services.tsx       # Core services offered
│   │   └── Skills.tsx         # Technical stack & proficiency metrics
│   ├── pages/                 # Full view pages
│   │   ├── ArticleDetails.tsx # Individual blog article reader view
│   │   ├── MyProjects.tsx     # Comprehensive projects showcase & filter
│   │   └── ProjectDetails.tsx # Deep-dive project view
│   └── admin/                 # CMS Admin portal
│       ├── pages/
│       │   ├── Dashboard.tsx  # Content management dashboard
│       │   ├── Login.tsx      # Admin authentication page
│       │   ├── AddProject.tsx # Project creation & image cropper
│       │   ├── EditProject.tsx# Project editor
│       │   ├── AddArticle.tsx # Markdown blog article publisher
│       │   └── EditArticle.tsx# Article editor
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel SPA routing & rewrites configuration
└── vite.config.ts             # Vite build & Tailwind plugin setup
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **yarn** / **pnpm**
- A **Firebase Project** (for Firestore and Auth)
- A **Gmail Account** with an *App Password* (for the contact form email service)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ishakibul186-sketch/portfolio.git
   cd portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Variables Setup

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Server / Email Configuration (Server-Side Only)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_gmail_app_password

# Firebase Client Configuration (Optional / Client-side)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the Development Server

Start the full-stack development environment (Express API + Vite Dev Server):

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Compile the client bundle and bundle the backend server:

```bash
npm run build
```

To run the production server locally:
```bash
npm start
```

---

## SEO & Search Console Configuration

This project includes built-in SEO enhancements:

1. **Google Search Console**:
   - Verification HTML File: `/public/googlead42dd66f9e0cb82.html`
   - Verification Meta Tag in `/index.html` (`google-site-verification: googlead42dd66f9e0cb82`)
2. **Sitemap**: `/public/sitemap.xml` with `<image:image>` tags and daily/weekly update frequency.
3. **Robots**: `/public/robots.txt` granting access to all public clean routes.
4. **Structured Data**: JSON-LD scripts in `<head>` for rich snippet rendering on Google, Bing, and DuckDuckGo.

---

## Deployment

### Vercel Deployment
This repository is configured for automatic continuous deployment on **Vercel**:
- `vercel.json` provides rewrite rules ensuring client-side routes (`/my-projects`, `/about`, `/skills`, `/blog`, `/contact`, `/articles/:id`) resolve without 404 errors.
- Set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in the **Vercel Project Settings > Environment Variables**.

### Google Cloud Run / Docker
The application binds to `0.0.0.0:3000` and can be built directly using the provided build scripts.

---

## Author & Social Profiles

**Shakibul Islam Prohor**  
*Full Stack Developer & Software Engineer*  
- 🌐 **Portfolio:** [shakibul-islam-portofolio.vercel.app](https://shakibul-islam-portofolio.vercel.app/)
- 💻 **GitHub:** [@ishakibul186-sketch](https://github.com/ishakibul186-sketch)
- 📸 **Instagram:** [@about_prohor](https://www.instagram.com/about_prohor/)
- 📘 **Facebook:** [facebook.com/prohor245](https://www.facebook.com/prohor245)
- 🚀 **Projects Platform:** [build-by-prohor.vercel.app](https://build-by-prohor.vercel.app)
- ✉️ **Email:** [ishakibul186@gmail.com](mailto:ishakibul186@gmail.com)

---

## License

This project is open-source and available under the [MIT License](LICENSE).
