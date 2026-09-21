# Nirāma (निराम) 🍃
### AI-Powered FMCG Nutrition & Food Purity Auditor

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

**Nirāma (निराम)** — from the Sanskrit word for *clean, pure, and undefiled* — is an intelligent FMCG nutrition auditor built specifically for Indian packaged food consumers. It cuts through deceptive front-of-pack marketing claims, analyzes ingredient labels, decodes cryptic INS additive codes, reveals disguised sugars and industrial palm oil, and provides actionable clean swaps.

---

## 🎯 Problem Statement

Over **80% of packaged foods in Indian supermarkets** carry misleading front-of-pack claims such as *"Immunity Booster"*, *"High Fibre"*, *"Real Badam Milk"*, or *"Diabetic Friendly"*. 

In reality:
- **Disguised Sugars**: Almost half of many children's "health drinks" are made of refined sugar and maltodextrin.
- **Cheap Industrial Oils**: "Digestive" and "healthy" biscuits frequently use bleached **Refined Palmolein Oil** instead of traditional fats.
- **Cryptic Additives**: Additive numbers (e.g. INS 150c, INS 471, INS 627) mask synthetic colorings, gut-disrupting emulsifiers, and flavor enhancers.

**Nirāma strips away the marketing spin and gives consumers the unvarnished scientific truth.**

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 📸 **Dual-Camera Multimodal Scan** | Upload or snap photos of both the front package and the back ingredient / nutritional table. |
| 🧬 **Purity Score (1 to 10)** | Instant rating factoring in processing degree, chemical additive load, and oil purity. |
| 🏷️ **NOVA Classification** | Categorizes products according to the international NOVA standard (Groups 1 to 4: Ultra-Processed Food / UPF). |
| 🔬 **Zero-Hallucination INS Decoder** | Deciphers Indian & Codex INS codes (e.g., INS 150c, INS 500ii, INS 471) into plain-English health risks and industrial purposes. |
| 🍬 **Sugar & Alias Radar** | Computes exact grams of sugar per 100g, visual teaspoon equivalents, and flags hidden aliases like Liquid Glucose, Maltodextrin, and Invert Syrup. |
| 🛢️ **Palm Oil & Industrial Fat Tracker** | Flags refined palmolein, hydrogenated vanaspati, and interesterified fats vs cold-pressed oils or desi cow ghee. |
| ⚖️ **Front-of-Pack Claim Reality Check** | Contrasts marketing claims directly against the back-of-pack ingredient list. |
| 🫀 **Long-Term Daily Risk Assessment** | Evaluates specific bodily impact on blood sugar, gut barrier / microbiome, and liver/heart health. |
| 🔄 **Clean FMCG & Desi Kitchen Swaps** | Recommends verified Indian clean brands (The Whole Truth, Two Brothers Organic Farms, Slurrp Farm) and traditional home kitchen recipes (Sattu Shakes, Makhana Chaat). |
| 🛡️ **Non-Food Item Guard** | Intelligently rejects non-food items (electronics, stationery, cosmetics) with clear explanations. |

---

## 🏗️ Architecture & Technology Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                  Client (Browser)                      │
   │   • Next.js 15 (React 19 + TypeScript)                 │
   │   • Canvas-based Client-side Image Optimizer (<1.5MB)  │
   │   • Framer Motion + Three.js + Lenis Smooth Scroll     │
   └──────────────────────────┬─────────────────────────────┘
                              │ POST /api/analyze (JSON Base64)
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │             Edge Runtime Engine (Cloudflare)           │
   │   • In-Memory Fast Cache (TTL 1hr)                     │
   │   • Verified Knowledgebase (Bournvita, NutriChoice...) │
   │   • Resilient Multi-tier AI Fallback Pipeline:         │
   │       1. Google Gemini Flash (3.8 / 3.7 / 3.6 / 3.5)   │
   │       2. Groq Qwen-32B (OpenAI SDK Compatible)         │
   │   • Zod Schema Validation & JSON Self-Healing Parser   │
   └────────────────────────────────────────────────────────┘
```

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lenis.
- **Backend / Edge**: Cloudflare Pages / Workers via `@cloudflare/next-on-pages` and `@opennextjs/cloudflare`.
- **Multimodal AI**: Google Gemini 3.8/3.7 Flash for visual label transcription and extraction.
- **Fast Reasoning AI**: Groq Qwen 32B for text querying and nutrition intelligence.
- **Data Validation**: Zod schema definitions with automatic truncation recovery and JSON normalization.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 20+ (Node 24 recommended)
- npm or pnpm
- API Keys:
  - **Gemini API Key**: [Google AI Studio](https://aistudio.google.com/) *(for vision analysis)*
  - **Groq API Key**: [Groq Console](https://console.groq.com/) *(for text analysis)*

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/nirama.git
cd nirama
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root folder:
```env
# Multimodal Vision Analysis (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# Ultra-Fast Text Analysis (Groq Qwen)
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🧪 Testing & Verification

Run the comprehensive test suites:
```bash
# Run all verification tests
npm test

# Run AI pipeline test suite
npm run test:ai

# Run live simulation test
npm run test:live

# Type checking
npm run typecheck
```

---

## ☁️ Cloudflare Pages Deployment

This project is optimized for deployment on **Cloudflare Pages** using the Edge runtime.

### Option A: Automatic Deployment via Git
1. Push your code to GitHub.
2. Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository with these settings:
   - **Framework preset**: `None` or `Next.js (Static HTML Export)`
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
4. Add your environment variables:
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
5. Click **Save and Deploy**.

### Option B: Deploy via Wrangler CLI
```bash
# Authenticate with Cloudflare
npx wrangler login

# Build bundle for Pages
npx @cloudflare/next-on-pages

# Deploy to Cloudflare Pages
npx wrangler pages deploy .vercel/output/static --project-name=nirama
```

---

## 📊 Sample Audit Output

When auditing a typical Indian malt chocolate drink:

```json
{
  "isFoodProduct": true,
  "productName": "Cadbury Bournvita Nutrition Drink",
  "brand": "Mondelez India Foods Private Limited",
  "purityScore": 2,
  "novaGroup": "4 - Ultra-Processed Food (UPF)",
  "summaryVerdict": "Despite marketing claiming inner strength and bone growth, it contains ~50% added sugars and maltodextrin. The tiny vitamin premix does not offset glycemic stress, synthetic caramel color (INS 150c), and chemical raising agents.",
  "sugarMetrics": {
    "sugarPer100g": 49.8,
    "teaspoonsEquivalent": 12.5,
    "hiddenSugarAliases": ["Maltodextrin", "Liquid Glucose", "Malt Extract"]
  },
  "fatMetrics": {
    "primaryOil": "Refined Palmolein Oil",
    "isRefinedOrHydrogenated": true
  },
  "consumptionAdvice": "Strictly a Treat / Highly Processed",
  "recommendations": {
    "cleanPackagedSwap": {
      "name": "100% Raw Cocoa & Nut Protein Milk Mix",
      "brandOrType": "The Whole Truth / Two Brothers Organic Farms",
      "whyBetter": "0g refined sugar, zero maltodextrin, sweetened exclusively with dates and almonds."
    },
    "desiKitchenSwap": {
      "name": "Roasted Sattu Badam Kheer Shake",
      "recipeOrFormat": "Blend roasted chana sattu, crushed almonds, cardamom, and organic jaggery in warm A2 cow milk.",
      "whyBetter": "Delivers 9g natural protein, prebiotic gut fiber, and zero chemical additives."
    }
  }
}
```

---

## 📁 Repository Structure

```
├── app/
│   ├── api/analyze/route.ts       # Cloudflare Edge API route (Gemini Vision + Groq)
│   ├── favicon.ico
│   ├── globals.css                # Tailwind base styles and custom animations
│   ├── layout.tsx                 # Root layout with metadata and smooth scrolling
│   └── page.tsx                   # Interactive single-page auditor interface
├── components/
│   ├── AiPrototypeDisclaimer.tsx  # Compliance & medical disclaimer modal
│   └── PhoneMockupShowcase.tsx    # Responsive mobile showcase demonstration
├── lib/
│   ├── imageOptimizer.ts          # Client-side canvas compression (<1.5MB target)
│   └── schema.ts                  # Zod schemas, TypeScript types, and validation
├── public/
│   ├── _headers                   # Cloudflare CDN security & caching headers
│   └── _routes.json               # Cloudflare routing configuration
├── scripts/
│   ├── test-ai-suite.ts           # Automated test suite for AI response parsing
│   └── test-live-simulation.ts    # End-to-end simulation script
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── wrangler.json                  # Cloudflare Pages configuration
```

---

## ⚖️ Disclaimer

Nirāma is an educational research and consumer transparency tool. It is not intended to replace professional medical diagnosis, nutritional therapy, or clinical advice. All nutritional assessments are based on published FSSAI standards, NOVA classification criteria, and food science literature.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
