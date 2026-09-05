import { Article } from "../types/article";

export const DEFAULT_ARTICLES: Article[] = [
  {
    id: "art-fullstack-microservices-architecture",
    title: "Mastering Full-Stack Architecture: Scalable Microservices with Node.js & React",
    slug: "mastering-fullstack-microservices-architecture",
    excerpt: "A comprehensive deep dive into designing robust, highly maintainable full-stack systems with event-driven architecture, resilient API contracts, and scalable backend microservices.",
    category: "Architecture",
    tags: ["Architecture", "Node.js", "React", "Microservices", "System Design"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    date: "2026-08-18",
    readingTime: "7 min read",
    author: "Shakibul Islam Prohor",
    createdAt: 1787040000000,
    seo: {
      title: "Mastering Full-Stack Architecture with Node.js & React | Shakibul Islam Prohor",
      description: "Learn how to build production-grade scalable full-stack applications with clean architecture, domain-driven design, and resilient backend microservices.",
      keywords: "Full Stack Architecture, Node.js, React, Microservices, System Design, Software Engineering, Shakibul Islam Prohor"
    },
    content: `## Introduction to Modern Full-Stack Engineering

As web applications evolve in complexity, architectural decisions made early in the development lifecycle dictate whether a system thrives under high traffic or succumbs to technical debt. Building scalable, performant, and maintainable software requires a methodical approach to state isolation, API contracts, and infrastructure decoupling.

In this guide, we break down battle-tested architectural principles for full-stack TypeScript applications spanning **React**, **Node.js/Express**, and distributed cloud services.

---

### Core Architectural Pillars

1. **Separation of Concerns & Clean Layering**
   - **Presentation Layer**: React frontend with declarative UI, atomic design components, and optimistic UI updates.
   - **Application / Service Layer**: Business logic isolated from transport protocols, allowing easy testing and framework portability.
   - **Data Access Layer**: Strongly-typed repositories interfacing with databases (PostgreSQL/Firebase) via query builders or ORMs.

2. **Contract-First API Design**
   Define type-safe API interfaces shared between client and server via TypeScript interfaces or OpenAPI specs:

\`\`\`typescript
// Shared API contract
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: number;
    pagination?: { page: number; totalPages: number; totalCount: number };
  };
}
\`\`\`

3. **Event-Driven Resilience**
   Decouple heavy background tasks (email dispatching, AI indexing, webhook retries) using asynchronous background queues and event streams rather than blocking HTTP request threads.

---

### Best Practices for High-Performance Backends

- **Connection Pooling**: Always manage database connection pools carefully to avoid connection starvation under traffic spikes.
- **Circuit Breakers**: Implement graceful degradation for 3rd-party integrations (e.g. payment gateways, AI endpoints).
- **Structured Logging & Telemetry**: Log requests with correlated trace IDs to rapidly diagnose latency bottlenecks in production.

> **Key Takeaway**: Great full-stack architecture isn't about using the newest trendy tools; it's about establishing clear boundaries, predictable state mutations, and resilient error recovery mechanisms.`
  },
  {
    id: "art-realtime-firebase-websockets",
    title: "Building Ultra-Fast Real-Time Applications with WebSockets and Firebase Realtime Database",
    slug: "building-realtime-apps-websockets-firebase",
    excerpt: "How to build low-latency real-time collaboration engines, live notification hubs, and synchronized dashboards using bi-directional WebSockets and Firebase data listeners.",
    category: "Realtime Systems",
    tags: ["WebSockets", "Firebase", "TypeScript", "Performance", "Realtime"],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
    date: "2026-08-12",
    readingTime: "6 min read",
    author: "Shakibul Islam Prohor",
    createdAt: 1786521600000,
    seo: {
      title: "Building Real-Time Web Applications with WebSockets & Firebase | Shakibul Islam Prohor",
      description: "A complete practical guide to creating zero-latency live sync dashboards, collaborative features, and push notification systems in React.",
      keywords: "Realtime WebSockets, Firebase Realtime Database, Live Sync, Event-Driven Web, React TypeScript"
    },
    content: `## Why Real-Time Capabilities Matter

Modern web users expect instant updates. Whether tracking order statuses, viewing live telemetry dashboards, or collaborating simultaneously on documents, waiting for page refreshes or polling endpoints every few seconds creates unnecessary server load and sluggish user experiences.

---

### WebSocket vs. Database Listeners

When designing real-time features, choosing the appropriate communication primitive is crucial:

| Feature | WebSockets (ws/Socket.IO) | Firebase Realtime DB |
| :--- | :--- | :--- |
| **Protocol** | Raw TCP Bi-directional | WebSocket + Long-polling fallback |
| **State Storage** | Ephemeral (In-Memory) | Durable Cloud JSON Tree |
| **Best For** | Chat rooms, game loops, live streams | Collaborative docs, presence, dashboard KPIs |
| **Scaling** | Cluster with Redis adapter | Built-in Google Cloud autoscaling |

---

### Implementing Efficient Real-Time Listeners in React

Prevent memory leaks and unnecessary re-renders by cleanly subscribing and unsubscribing in lifecycle hooks:

\`\`\`typescript
import { useEffect, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import { db } from "../lib/firebase";

export function useLiveStatus(resourceId: string) {
  const [status, setStatus] = useState<string>("idle");

  useEffect(() => {
    if (!resourceId) return;
    const statusRef = ref(db, \`resources/\${resourceId}/status\`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatus(snapshot.val());
      }
    });

    return () => {
      // Clean up event listener when component unmounts
      unsubscribe();
    };
  }, [resourceId]);

  return status;
}
\`\`\`

---

### Handling Offline Recovery & Sync

Ensure your application handles network disconnections smoothly by caching recent states and applying optimistic UI updates with automatic reconciliation when connectivity returns.`
  },
  {
    id: "art-production-typescript-best-practices",
    title: "Production-Grade TypeScript: Patterns, Performance, and Type Safety at Scale",
    slug: "production-grade-typescript-best-practices",
    excerpt: "Explore advanced TypeScript techniques including discriminated unions, generic constraints, conditional types, and brand types to eliminate runtime bugs in enterprise codebases.",
    category: "TypeScript & Frontend",
    tags: ["TypeScript", "Clean Code", "Design Patterns", "Frontend", "Best Practices"],
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
    date: "2026-08-05",
    readingTime: "8 min read",
    author: "Shakibul Islam Prohor",
    createdAt: 1785916800000,
    seo: {
      title: "Production-Grade TypeScript Best Practices | Shakibul Islam Prohor",
      description: "Master advanced TypeScript patterns to build safer, faster, and bug-free enterprise web applications.",
      keywords: "TypeScript, Advanced TypeScript, Discriminated Unions, Type Safety, Frontend Engineering, React"
    },
    content: `## The True Power of Strict Type Systems

TypeScript is far more than just adding \`: string\` and \`: number\` to JavaScript functions. When leveraged effectively, TypeScript serves as executable documentation and a compile-time verification layer that eliminates entire categories of runtime errors before code reaches staging.

---

### 1. Discriminated Unions for Bulletproof State Machines

Avoid ambiguous state combinations (e.g. \`isLoading && isError && data\`) by modeling finite states as discriminated unions:

\`\`\`typescript
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T; fetchedAt: number }
  | { status: "error"; error: Error };

function renderView(state: AsyncState<UserProfile>) {
  switch (state.status) {
    case "idle":
      return <EmptyPlaceholder />;
    case "loading":
      return <LoadingSpinner />;
    case "success":
      // TypeScript guarantees state.data exists here!
      return <ProfileCard profile={state.data} />;
    case "error":
      return <ErrorMessage message={state.error.message} />;
  }
}
\`\`\`

---

### 2. Branded Types for Domain Modeling

Prevent passing the wrong string identifier (e.g. accidentally passing a \`UserId\` into an \`OrderId\` parameter):

\`\`\`typescript
type Brand<K, T> = K & { readonly __brand: T };

export type UserId = Brand<string, "UserId">;
export type OrderId = Brand<string, "OrderId">;

function processOrder(userId: UserId, orderId: OrderId) {
  // Safe from argument transposition bugs!
}
\`\`\`

---

### Summary Checklist for Clean TypeScript

- Enable \`"strict": true\` and \`"noImplicitAny": true\` in \`tsconfig.json\`.
- Avoid the \`any\` escape hatch; prefer \`unknown\` when dealing with unvalidated external input.
- Use \`as const\` for immutable configuration dictionaries to preserve literal types.`
  },
  {
    id: "art-modern-pos-inventory-pwa",
    title: "Modern POS & Inventory Engineering: Offline-First Architecture with PWAs",
    slug: "modern-pos-inventory-offline-first-pwa",
    excerpt: "Architecting resilient Retail Point of Sale (POS) and inventory systems that continue operating seamlessly during internet outages using background sync and local queuing.",
    category: "Full Stack & POS",
    tags: ["POS", "PWA", "Offline-First", "IndexedDB", "E-Commerce"],
    image: "https://images.unsplash.com/photo-1556742049-0a67e5572263?q=80&w=1200&auto=format&fit=crop",
    date: "2026-07-28",
    readingTime: "6 min read",
    author: "Shakibul Islam Prohor",
    createdAt: 1785225600000,
    seo: {
      title: "Modern POS & Inventory Engineering: Offline-First PWAs | Shakibul Islam Prohor",
      description: "How to engineer high-speed Point of Sale and inventory systems with offline-first local databases, thermal printer integration, and real-time syncing.",
      keywords: "POS System, Point of Sale, PWA, Offline First, Inventory Management, Barcode Scanner, Web Architecture"
    },
    content: `## The Mission-Critical Nature of Point-of-Sale Systems

In physical retail environments, a cash register terminal cannot freeze or display an error message simply because the Wi-Fi connection dropped for two minutes. A modern web-based POS system must provide instantaneous barcode scanning, sub-second receipt printing, and seamless offline resilience.

---

### Architectural Blueprint for Offline-First Retail

1. **Local Data Persistence (IndexedDB & Memory Cache)**
   Maintain full product catalogs, pricing tiers, and tax rules cached locally in the browser so lookups execute in under 10 milliseconds.

2. **Transactional Outbox Queue**
   When an order is completed offline:
   - Generate a deterministic UUID for the transaction.
   - Record the sale into a local offline outbox table.
   - Deduct local stock counts immediately to prevent overselling.
   - Dispatch to cloud databases once network connectivity is re-established.

\`\`\`typescript
interface OfflineTransaction {
  id: string;
  items: Array<{ barcode: string; qty: number; price: number }>;
  total: number;
  paymentMethod: "CASH" | "CARD" | "MFS";
  synced: boolean;
  timestamp: number;
}
\`\`\`

3. **Hardware Integration via Web APIs**
   - **Web Bluetooth / USB**: Direct communication with ESC/POS 58mm & 80mm thermal receipt printers.
   - **Keyboard Emulation Scanners**: Global keydown listeners with debounce buffering for optical barcode readers.

---

### Conflict Resolution Strategies

When multiple store registers process sales simultaneously while disconnected, cloud merge logic uses timestamped event logs to reconcile inventory variations without losing transaction history.`
  },
  {
    id: "art-multitenant-saas-security",
    title: "Multi-Tenant SaaS Security & Database Sharding: An Engineering Blueprint",
    slug: "multitenant-saas-security-database-sharding",
    excerpt: "A practical guide to multi-tenant isolation, row-level security (RLS), role-based access control (RBAC), and automated tenant provisioning in modern cloud SaaS platforms.",
    category: "SaaS & Security",
    tags: ["SaaS", "Security", "PostgreSQL", "Database", "Authentication"],
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
    date: "2026-07-20",
    readingTime: "9 min read",
    author: "Shakibul Islam Prohor",
    createdAt: 1784534400000,
    seo: {
      title: "Multi-Tenant SaaS Security & Architecture | Shakibul Islam Prohor",
      description: "Learn how to architect secure multi-tenant B2B SaaS platforms with tenant isolation, PostgreSQL Row Level Security, and custom subdomain routing.",
      keywords: "Multi-Tenant SaaS, SaaS Security, PostgreSQL RLS, RBAC, Cloud Architecture, Tenant Isolation"
    },
    content: `## Tenant Isolation: The Core of B2B SaaS

When building Software-as-a-Service (SaaS) products catering to business clients, guaranteeing data confidentiality between organizations is non-negotiable. A single data leak between competitors can destroy user trust and lead to severe regulatory penalties.

---

### Choosing the Right Isolation Model

1. **Shared Database, Shared Schema with Discriminator Column (Most Cost-Effective)**
   - Every database table includes a \`tenant_id\` column.
   - Enforce isolation at the database layer using PostgreSQL **Row Level Security (RLS)**.

2. **Shared Database, Separate Schemas (Balanced)**
   - Each tenant gets their own PostgreSQL schema within the same database instance.
   - High isolation while retaining shared infrastructure cost savings.

3. **Isolated Database per Tenant (Enterprise Tier)**
   - Dedicated database instances for high-compliance healthcare and financial clients.

---

### PostgreSQL Row-Level Security Example

\`\`\`sql
-- Enable RLS on core business tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Define tenant isolation policy
CREATE POLICY tenant_isolation_policy ON invoices
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
\`\`\`

---

### Secure Role-Based Access Control (RBAC) Matrix

Implement granular permission checks verifying both **Tenant ID** and **User Role** (Owner, Admin, Manager, Staff, Viewer) on every incoming API route.`
  },
  {
    id: "art-integrating-generative-ai-llms",
    title: "Integrating Generative AI & Large Language Models into Web Applications",
    slug: "integrating-generative-ai-llms-web-apps",
    excerpt: "How to build production-grade AI features using Google Gemini SDK, streaming responses, structured JSON outputs, semantic search embeddings, and resilient fallback strategies.",
    category: "AI & Machine Learning",
    tags: ["AI", "Gemini API", "LLM", "Prompt Engineering", "Full Stack"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
    date: "2026-07-14",
    readingTime: "7 min read",
    author: "Shakibul Islam Prohor",
    createdAt: 1784016000000,
    seo: {
      title: "Integrating Generative AI & Gemini API in Web Apps | Shakibul Islam Prohor",
      description: "Practical engineering guide to adding Gemini AI capabilities, streaming token responses, and structured JSON parsing to React and Node.js apps.",
      keywords: "Generative AI, Google Gemini API, LLM Integration, React AI, Node.js AI SDK, Prompt Engineering"
    },
    content: `## Transforming Web Apps with Intelligent Workflows

Generative AI has shifted from a novelty to an essential capability in modern web development. From automated code review assistants and conversational support bots to intelligent document summarizers, integrating Large Language Models (LLMs) requires robust API design and strict output validation.

---

### Secure Server-Side AI Architecture

Never expose your Gemini API keys or external AI credentials in client-side bundles. Always proxy AI requests through secure backend endpoints with authentication and rate limiting:

\`\`\`typescript
// Server-side Gemini API integration
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeCodeSnippet(code: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: "Analyze this code for potential security vulnerabilities and performance bottlenecks:\n\n" + code }
        ]
      }
    ],
    config: {
      temperature: 0.2, // Lower temperature for analytical precision
    }
  });

  return response.text || "No insights generated.";
}
\`\`\`

---

### Streaming Responses for Real-Time UX

Waiting 5-10 seconds for an AI model to complete a long response results in poor perceived performance. Use Server-Sent Events (SSE) or WebSockets to stream tokens to the frontend in real time, rendering chunks as they are generated.`
  },
  {
    id: "art-zerodowntime-cicd-docker-devops",
    title: "Zero-Downtime CI/CD Pipelines: Automated Testing, Docker & Cloud Deployment",
    slug: "zero-downtime-cicd-docker-cloud-deployment",
    excerpt: "Step-by-step methodology for setting up bulletproof continuous integration and deployment pipelines with GitHub Actions, containerization, automated testing, and zero-downtime rollouts.",
    category: "DevOps & Cloud",
    tags: ["DevOps", "Docker", "CI/CD", "GitHub Actions", "Cloud Run"],
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1200&auto=format&fit=crop",
    date: "2026-07-06",
    readingTime: "5 min read",
    author: "Shakibul Islam Prohor",
    createdAt: 1783324800000,
    seo: {
      title: "Zero-Downtime CI/CD with Docker & GitHub Actions | Shakibul Islam Prohor",
      description: "Automate your engineering workflow with automated testing, multi-stage Docker builds, and zero-downtime production deployments.",
      keywords: "CI/CD, DevOps, Docker, GitHub Actions, Cloud Run, Automated Testing, Zero Downtime Deployment"
    },
    content: `## The Modern Delivery Pipeline

Shipping software with confidence requires automated safety nets. A well-constructed Continuous Integration and Continuous Deployment (CI/CD) pipeline ensures every pull request is validated, linted, tested, and containerized before reaching production environments.

---

### The Three-Phase Pipeline

1. **Lint & Static Type Checking**: Catch syntax errors and type mismatches instantly using \`eslint\` and \`tsc --noEmit\`.
2. **Automated Unit & Integration Testing**: Execute comprehensive test suites with Vitest / Jest to prevent regression bugs.
3. **Multi-Stage Docker Containerization**: Create lean, secure container images discarding development dependencies.

\`\`\`dockerfile
# Multi-Stage Production Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
\`\`\`

---

### Blue-Green & Rolling Deployments

Deploy new revisions alongside existing active containers. Only when health check endpoints respond with HTTP 200 OK does the reverse proxy switch user traffic to the new revision, ensuring zero downtime for end users.`
  }
];
