# Hosting Nirāma on Cloudflare Pages

This project is configured for seamless deployment to **Cloudflare Pages** using `@cloudflare/next-on-pages` and Cloudflare Workers Edge runtime.

## Configuration Files Added

- `wrangler.json`: Cloudflare configuration specifying project settings and `nodejs_compat` compatibility flag.
- `next.config.ts`: Configures `images: { unoptimized: true }` for static/CDN image delivery.
- `public/_routes.json`: Defines route matching for static assets vs dynamic Edge Functions.
- `public/_headers`: Security and caching headers for Cloudflare CDN.
- `app/api/analyze/route.ts`: Updated to `export const runtime = "edge";` for global edge execution.

---

## Method 1: Deploy via Cloudflare Dashboard (GitHub / Git Integration - Recommended)

1. **Push your repository** to GitHub or GitLab.
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository and configure the deployment settings:
   - **Framework preset**: `Next.js (Static HTML Export)` or `None`
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
4. In **Environment variables (advanced)**, add your API keys:
   - `GROQ_API_KEY`: Your Groq API key (`gsk_...`)
   - `GEMINI_API_KEY`: (Optional) Your Gemini API key fallback
5. Click **Save and Deploy**. Cloudflare will build and deploy your site automatically!

---

## Method 2: Deploy via CLI (Wrangler)

1. **Install Cloudflare Wrangler CLI dependencies** (if not installed):
   ```bash
   npm install
   ```

2. **Log into Cloudflare**:
   ```bash
   npx wrangler login
   ```

3. **Build the Cloudflare Pages bundle**:
   ```bash
   npm run pages:build
   ```

4. **Deploy to Cloudflare Pages**:
   ```bash
   npm run deploy
   ```

---

## Useful Local Commands

- **Local Preview of Cloudflare Pages**:
  ```bash
  npm run preview
  ```

- **Type Check**:
  ```bash
  npm run typecheck
  ```
