# Shakibul Islam Prohor — Full Stack Portfolio & Engineering Platform

[![Website](https://img.shields.io/badge/Live_Site-shakibul--islam--portofolio.vercel.app-7000FF?style=for-the-badge&logo=vercel&logoColor=white)](https://shakibul-islam-portofolio.vercel.app/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.8-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase_12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/Vercel_Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

> **Official portfolio, dynamic showcase, and CMS platform of Shakibul Islam Prohor** — Full Stack Developer & Software Engineer based in Dhaka, Bangladesh. Engineered with hybrid SSR + CSR architecture, real-time dynamic SEO injection, responsive cyberpunk design, and automated email services.

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Routing (Hybrid SSR + CSR)](#architecture--routing-hybrid-ssr--csr)
- [Key Features](#key-features)
  - [1. Interactive Cyberpunk Portfolio (SPA)](#1-interactive-cyberpunk-portfolio-spa)
  - [2. Projects Showcase & Deep-Dive Details](#2-projects-showcase--deep-dive-details)
  - [3. Technical Articles & Blog Engine](#3-technical-articles--blog-engine)
  - [4. Admin CMS Dashboard & Keyword Studio](#4-admin-cms-dashboard--keyword-studio)
  - [5. Communication & Broadcast Engine](#5-communication--broadcast-engine)
  - [6. Dynamic SEO, Social Cards & OpenGraph](#6-dynamic-seo-social-cards--opengraph)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Development Server](#running-development-server)
  - [Building for Production](#building-for-production)
- [Deployment on Vercel](#deployment-on-vercel)
- [Author & Social Profiles](#author--social-profiles)
- [License](#license)

---

## Overview

This application is a production-grade personal portfolio, project showcase, and content platform. It combines a client-side SPA (Single-Page Application) for instant page transitions with targeted Server-Side Rendering (SSR) for search crawlers and social share previews.

### Live URLs:
- **Production Site:** [https://shakibul-islam-portofolio.vercel.app](https://shakibul-islam-portofolio.vercel.app)
- **Projects Showcase:** [https://shakibul-islam-portofolio.vercel.app/my-projects](https://shakibul-islam-portofolio.vercel.app/my-projects)
- **Specific Project Example:** [https://shakibul-islam-portofolio.vercel.app/my-projects/5](https://shakibul-islam-portofolio.vercel.app/my-projects/5)
- **Technical Blog:** [https://shakibul-islam-portofolio.vercel.app/blog](https://shakibul-islam-portofolio.vercel.app/blog)
- **About Me:** [https://shakibul-islam-portofolio.vercel.app/about](https://shakibul-islam-portofolio.vercel.app/about)
- **Skills Grid:** [https://shakibul-islam-portofolio.vercel.app/skills](https://shakibul-islam-portofolio.vercel.app/skills)
- **Contact:** [https://shakibul-islam-portofolio.vercel.app/contact](https://shakibul-islam-portofolio.vercel.app/contact)

---

## Architecture & Routing (Hybrid SSR + CSR)

The platform utilizes a **hybrid routing strategy** that maximizes performance and search visibility:

| Page Category | Routes | Rendering Method | Description |
| :--- | :--- | :--- | :--- |
| **Project Details** | `/my-projects/:id`, `/projects/:id` | **Server-Side Rendered (SSR)** | Pre-fetches project data from Firebase RTDB and dynamically injects title, description, custom meta keywords, canonical tags, JSON-LD schema, and HTML snippet before serving to browser/crawlers. |
| **Article Details** | `/articles/:id`, `/blog/:id` | **Server-Side Rendered (SSR)** | Pre-fetches article contents, tags, and cover image, injecting rich OpenGraph and Article schema markup. |
| **General Pages** | `/`, `/about`, `/skills`, `/contact`, `/my-projects`, `/blog`, `/admin` | **Client-Side Routing (CSR)** | Served instantly from Vercel's Edge CDN / static `dist/index.html`. React Router v7 handles client-side transitions without invoking serverless functions. |

### Vercel Serverless Function & Fail-Safe Architecture
* **`api/index.ts`:** Central serverless handler for SSR and API endpoints. Fully ES Module (`"type": "module"`) compliant.
* **`api/_lib/`:** Modular internal library containing `seoInjector.ts` and `embeddedTemplate.ts`. The underscore prefix `_` prevents Vercel from exposing internal helpers as public endpoints or causing file name collisions.
* **`scripts/sync-template.js`:** Build-time script that embeds the compiled production HTML into `api/_lib/embeddedTemplate.ts`. This guarantees that direct URL visits and page refreshes never encounter 500 Internal Server Errors, even in ephemeral serverless containers.

---

## Key Features

### 1. Interactive Cyberpunk Portfolio (SPA)
- **Theme:** Cyberpunk dark cosmic palette (`#030014`), violet/cyan ambient glows, and glassmorphic translucent panels.
- **Fluid Motion:** Section entry transitions, magnetic hover states, and smooth spring physics powered by `motion/react`.
- **Mobile First & Fully Responsive:** Responsive breakpoints from 320px mobile screens up to 4K displays.
- **Components:** Interactive Hero with rotating roles, About section, Experience timeline, Services grid, Skills categorization, and Interactive Contact.

### 2. Projects Showcase & Deep-Dive Details
- **Dynamic Projects Showcase (`/my-projects`):** Filter by category (*All*, *Full Stack*, *React / Next.js*, *Frontend*, *AI & ML*, *Cloud / Backend*), with live real-time keyword search.
- **Individual Project View (`/my-projects/:id`):** 
  - Dynamic SEO title, custom meta keywords, OpenGraph card, and Twitter preview tags.
  - High-resolution thumbnail preview, project summary, challenge breakdown, core services tags, and feature list.
  - Direct links to live deployment and GitHub source repository.

### 3. Technical Articles & Blog Engine
- **Markdown Tutorials (`/blog` & `/articles/:id`):** Full markdown compilation with syntax highlighting, lists, quotes, and responsive tables via `react-markdown`.
- **Reading Metadata:** Automatic reading time calculation, publication timestamp, author badge, and tag filter.
- **Social Sharing:** Instant share triggers for X/Twitter, LinkedIn, Facebook, and link copy.

### 4. Admin CMS Dashboard & Keyword Studio
- **Secure Authentication:** Protected with Firebase Authentication and persistent session state.
- **Project Management:** Create, edit, delete, and feature projects with instant cloud database sync.
- **Meta Keywords Studio:**
  - Interactive badge system for adding, previewing, and removing keywords.
  - Bulk comma-separated pasting and raw text / tag mode toggle.
  - One-click **Auto-Generate SEO** tool that automatically creates optimized meta keywords and descriptions from project features.
- **Article Publisher:** Rich markdown editor with live side-by-side preview and image cover management.
- **Image Cropper:** Integrated `react-easy-crop` interface for aspect-ratio cropping and optimizing banners before uploading.

### 5. Communication & Broadcast Engine
- **Contact Form (`/api/contact`):** Validated contact inquiry form that dispatches HTML emails via Nodemailer Gmail SMTP directly to the developer.
- **Admin Reply API (`/api/reply-message`):** Send direct email replies to client inquiries from the admin panel.
- **Broadcast Email API (`/api/send-broadcast`):** Dispatch announcements and newsletters to subscriber lists with BCC protection.

### 6. Dynamic SEO, Social Cards & OpenGraph
- **Custom Keywords Prioritization:** Project-specific keywords entered in the admin panel are prioritized on `<meta name="keywords">`.
- **JSON-LD Structured Data:** Injected schemas for `SoftwareApplication`, `BlogPosting`, `Person`, and `WebSite`.
- **Google Search Console Ready:** Includes verified meta tags and `/public/googlead42dd66f9e0cb82.html`.
- **Sitemap & Robots:** Validated `/public/sitemap.xml` with image nodes and `/public/robots.txt`.

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
- **Client Meta Tags:** [React Helmet Async](https://github.com/staylor/react-helmet-async)
- **Markdown:** [React Markdown](https://github.com/remarkjs/react-markdown)
- **Image Cropping:** [React Easy Crop](https://github.com/ValentinH/react-easy-crop)

### Backend & Cloud
- **Server:** [Express.js](https://expressjs.com/) (Node.js runtime)
- **Serverless Runtime:** [Vercel Serverless Functions](https://vercel.com/docs/functions)
- **Database & Auth:** [Firebase Realtime Database](https://firebase.google.com/) & Firebase Authentication
- **Email Delivery:** [Nodemailer](https://nodemailer.com/) (Gmail SMTP)
- **Bundler & Tools:** [esbuild](https://esbuild.github.io/), [TSX](https://github.com/privatenumber/tsx)

---

## Project Directory Structure

```
├── .env.example                  # Environment variable blueprint
├── .gitignore                    # Git ignore file (excludes build & temp files)
├── index.html                    # Single-page HTML entry template
├── metadata.json                 # Project capabilities & studio metadata
├── package.json                  # Scripts & dependencies
├── tsconfig.json                 # TypeScript strict compiler config
├── vercel.json                   # Vercel rewrites & serverless routing config
├── vite.config.ts                # Vite config with Tailwind CSS v4 plugin
├── server.ts                     # Local Express development server & full-stack runner
├── api/                          # Vercel Serverless Function entry point
│   └── index.ts                  # Fully self-contained serverless handler (SSR & API endpoints)
├── public/                       # Static public assets
│   ├── googlead42dd66f9e0cb82.html  # Google Search Console ownership file
│   ├── prohor-v2.png             # Avatar & default social preview banner
│   ├── robots.txt                # Search engine crawler instructions
│   └── sitemap.xml               # Search engine XML sitemap
└── src/
    ├── main.tsx                  # React 19 client entry point
    ├── App.tsx                   # Routes definition & App layout
    ├── index.css                 # Global CSS & Tailwind v4 theme definitions
    ├── context/
    │   └── AuthContext.tsx       # Firebase authentication state provider
    ├── types/
    │   └── project.ts            # Project & article TypeScript interfaces
    ├── lib/
    │   └── firebase.ts           # Firebase SDK initialization
    ├── components/               # UI components
    │   ├── Navbar.tsx            # Responsive glass navigation bar
    │   ├── Hero.tsx              # Animated hero section
    │   ├── About.tsx             # Biography & statistics
    │   ├── Skills.tsx            # Technical stack badges & skill levels
    │   ├── Experience.tsx        # Career timeline & milestones
    │   ├── Projects.tsx          # Featured projects preview
    │   ├── Blog.tsx              # Featured articles preview
    │   ├── Contact.tsx           # Contact form & social connections
    │   └── Footer.tsx            # Footer & copyright credits
    ├── pages/                    # Main views
    │   ├── MyProjects.tsx        # Projects list with real-time filters
    │   ├── ProjectDetails.tsx    # Individual project details & Helmet tags
    │   └── ArticleDetails.tsx    # Individual article reader view
    └── admin/                    # Admin CMS Portal
        └── pages/
            ├── Dashboard.tsx     # Admin overview & metrics
            ├── Login.tsx         # Secure admin login
            ├── ProjectsAdmin.tsx # Project management, SEO keywords studio, & cropper
            ├── ArticlesAdmin.tsx # Blog article manager & markdown editor
            └── MessagesAdmin.tsx # Contact messages viewer & reply system
```

---

## Getting Started

### Prerequisites
- **Node.js:** `v18.0.0` or higher
- **npm:** `v9.0.0` or higher
- A **Firebase Project** with Realtime Database / Firestore and Authentication enabled.
- A **Gmail Account** with an *App Password* generated for SMTP email dispatch.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ishakibul186-sketch/Shakibul-islam-portofolio-.git
   cd Shakibul-islam-portofolio-
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

Copy the `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

Fill in the necessary variables:

```env
# Server / Email Configuration (Nodemailer SMTP)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

# Client Firebase Configuration (Optional if hardcoded or client-initialized)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running Development Server

Start the full-stack dev server (Express backend + Vite development middlewares):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To build the client bundle, compile server files, and synchronize the embedded SSR template:

```bash
npm run build
```

This runs:
1. `vite build` — bundles client assets to `dist/`.
2. `esbuild server.ts` — bundles Express server to `dist/server.cjs`.
3. `node scripts/sync-template.js` — syncs the compiled HTML into `api/_lib/embeddedTemplate.ts`.

To test the production build locally:
```bash
npm start
```

---

## Deployment on Vercel

The project is pre-configured for seamless zero-config deployment on **Vercel**:

1. **Push your code to GitHub:**
   ```bash
   git push origin main
   ```
2. **Import the repository into Vercel:**
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Set Environment Variables in Vercel:**
   - `GMAIL_USER` = your gmail address
   - `GMAIL_APP_PASSWORD` = your app password
4. **Deploy:** Vercel automatically deploys the client assets to edge CDN and maps `/api/index.ts` for dynamic project details (`/my-projects/:id`), articles (`/articles/:id`), and email services (`/api/contact`).

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

This project is licensed under the [MIT License](LICENSE).
