import { Project } from "../types/project";

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: "nexusecommerce-platform",
    numericId: 4,
    title: "NexusShop - Next-Gen E-Commerce Platform",
    category: "E-Commerce / Full Stack",
    status: "Live",
    description:
      "A modern, high-performance full-stack e-commerce marketplace featuring real-time inventory synchronization, multi-currency checkout via Stripe & SSLCommerz, customer reviews, AI-powered product recommendations, and an integrated vendor administrative dashboard.",
    thumbnail:
      "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    ],
    features: [
      "Lightning-fast product catalog search with faceted category, price & rating filters",
      "Secure guest and customer checkout with Stripe, SSLCommerz, and Cash on Delivery",
      "Real-time stock reservation and automated low-inventory alerts via Firebase triggers",
      "Dynamic customer wishlist, shopping cart persistence, and order tracking timeline",
      "Role-based Vendor & Admin Dashboard with revenue analytics and sales export",
      "SEO optimized product detail pages with automated schema.org Product markup",
    ],
    coreServices: [
      "React",
      "TypeScript",
      "Node.js",
      "Express",
      "Firebase",
      "Tailwind CSS",
      "Stripe API",
      "Redux Toolkit",
    ],
    githubUrl: "https://github.com/ishakibul186-sketch",
    deployUrl: "https://shakibul-islam-portofolio.vercel.app",
    metaTitle: "NexusShop - Next-Gen E-Commerce Platform | Shakibul Islam Prohor",
    metaDescription:
      "Explore NexusShop, a full-stack e-commerce platform with real-time inventory, secure multi-currency payments, and comprehensive vendor analytics.",
    metaKeywords:
      "E-Commerce Platform, React E-Commerce, Stripe Integration, Full Stack Web App, Shakibul Islam Prohor, NexusShop, Online Store, Realtime Inventory",
    metaCategory: "E-Commerce / Full Stack Web Application",
    createdAt: 1715000000000,
    updatedAt: 1715000000000,
  },
  {
    id: "omnistore-shop-management",
    numericId: 3,
    title: "OmniStore - Retail POS & Shop Management System",
    category: "Shop Management & POS",
    status: "Live",
    description:
      "An enterprise-grade point-of-sale (POS) and retail management software designed for multi-branch retail businesses. Features barcode scanning, instant invoice generation, customer debt (Khata) ledger, inventory forecasting, and real-time profit/loss reporting.",
    thumbnail:
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop",
    ],
    features: [
      "Sub-second POS billing terminal with Bluetooth thermal printer & barcode reader support",
      "Multi-branch stock transfer, automated low-stock notifications & supplier management",
      "Customer credit/due book (Khata) with automated SMS payment reminder alerts",
      "Comprehensive profit/loss, daily sales, VAT computation & expense breakdown charts",
      "Granular Role-Based Access Control (Cashier, Store Manager, Super Admin)",
      "Offline-first data synchronization with cloud backup upon reconnection",
    ],
    coreServices: [
      "React",
      "TypeScript",
      "Node.js",
      "Firebase Realtime DB",
      "Tailwind CSS",
      "Chart.js",
      "PWA",
      "REST API",
    ],
    githubUrl: "https://github.com/ishakibul186-sketch",
    deployUrl: "https://shakibul-islam-portofolio.vercel.app",
    metaTitle: "OmniStore - Retail POS & Shop Management System | Shakibul Islam Prohor",
    metaDescription:
      "OmniStore is a multi-branch retail POS and inventory management system with automated billing, barcode scanning, and real-time financial reporting.",
    metaKeywords:
      "Shop Management System, POS Software, Retail Management, Inventory Management, Barcode Billing, React POS, Shakibul Islam Prohor",
    metaCategory: "Retail Software / POS / Business Management",
    createdAt: 1714000000000,
    updatedAt: 1714000000000,
  },
  {
    id: "cloudmetrics-saas-dashboard",
    numericId: 2,
    title: "CloudMetrics - Multi-Tenant SaaS Analytics Dashboard",
    category: "SaaS & Analytics",
    status: "Live",
    description:
      "A modern, scalable SaaS subscription management and product telemetry dashboard. Delivers interactive cohort retention analysis, MRR/ARR financial forecasting, user engagement funnels, AI-driven churn risk warnings, and team collaboration permissions.",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
    ],
    features: [
      "Real-time executive dashboard tracking MRR, ARR, Churn Rate, LTV, and CAC",
      "Interactive D3 / Recharts visual analytics with customizable timeframes & metric slicing",
      "Multi-tenant workspace isolation with custom branding and team member invites",
      "Automated invoice generation, webhook event listening & Stripe Billing integration",
      "AI-assisted customer health scoring with predictive churn prevention recommendations",
      "Dark / Light mode custom UI system with ultra-fast data caching layer",
    ],
    coreServices: [
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Tailwind CSS",
      "Recharts",
      "Stripe Billing",
      "Firebase",
    ],
    githubUrl: "https://github.com/ishakibul186-sketch",
    deployUrl: "https://shakibul-islam-portofolio.vercel.app",
    metaTitle: "CloudMetrics - Multi-Tenant SaaS Analytics Dashboard | Shakibul Islam Prohor",
    metaDescription:
      "CloudMetrics is an enterprise SaaS metrics and revenue intelligence dashboard featuring real-time MRR analytics, cohort retention, and churn prevention.",
    metaKeywords:
      "SaaS Dashboard, SaaS Analytics, MRR Dashboard, React Dashboard, Data Visualization, Shakibul Islam Prohor, Business Intelligence",
    metaCategory: "SaaS Dashboard / Business Intelligence",
    createdAt: 1713000000000,
    updatedAt: 1713000000000,
  },
  {
    id: "devpulse-ai-pipeline",
    numericId: 1,
    title: "DevPulse - AI Code Reviewer & DevOps Pipeline Monitor",
    category: "AI Tools & Systems",
    status: "Live",
    description:
      "An AI-powered automated code quality analyzer and CI/CD pipeline supervisor. Automatically inspects GitHub pull requests for security vulnerabilities, generates unit test suites, suggests performance optimizations, and monitors deploy health in real-time.",
    thumbnail:
      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop",
    ],
    features: [
      "Automated pull request diff analysis powered by modern LLMs and semantic code parsers",
      "Security vulnerability detection (OWASP Top 10, secret leaks, and dependency audits)",
      "One-click automated unit test generation for TypeScript, Python, and Go codebases",
      "Real-time GitHub Webhook event streaming with interactive review comments",
      "CI/CD build failure root-cause analyzer with remediation patch suggestions",
      "Comprehensive developer velocity and code health scoring board",
    ],
    coreServices: [
      "React",
      "TypeScript",
      "Node.js",
      "Gemini API",
      "GitHub API",
      "Docker",
      "Tailwind CSS",
      "WebSockets",
    ],
    githubUrl: "https://github.com/ishakibul186-sketch",
    deployUrl: "https://shakibul-islam-portofolio.vercel.app",
    metaTitle: "DevPulse - AI Code Reviewer & DevOps Pipeline Monitor | Shakibul Islam Prohor",
    metaDescription:
      "DevPulse is an AI-powered code review and CI/CD monitoring system that automates vulnerability detection, test generation, and pull request reviews.",
    metaKeywords:
      "AI Code Review, Gemini API, Developer Tools, GitHub Actions, DevOps Dashboard, Shakibul Islam Prohor, Automated Testing",
    metaCategory: "AI Tool / Developer Infrastructure",
    createdAt: 1712000000000,
    updatedAt: 1712000000000,
  },
];
