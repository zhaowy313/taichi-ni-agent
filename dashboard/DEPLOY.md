# Frontend Deployment Guide (Cloudflare Pages)

This guide outlines the steps to deploy the dashboard to Cloudflare Pages.

## Prerequisites

- Cloudflare account.
- GitHub repository connected.

## Steps

1.  **Log in to Cloudflare Dashboard.**
2.  **Go to Workers & Pages > Create Application > Pages > Connect to Git.**
3.  **Select Repository:** `taichi-ni-agent`.
4.  **Setup Builds:**
    -   **Project Name:** `taichi-ni-dashboard` (or similar).
    -   **Production Branch:** `master`.
    -   **Framework Preset:** `Next.js`.
    -   **Build Command:** `npm run build` (default).
    -   **Build Output Directory:** `.next` (default).
5.  **Environment Variables:**
    -   No specific env vars needed for static build unless you add build-time configuration.
    -   **Important:** You need to configure the API proxy. Since Cloudflare Pages doesn't support `next.config.js` rewrites to an external Worker easily without Functions, you have two options:
        -   **Option A (Recommended):** Deploy the dashboard as a static export (`output: 'export'` in `next.config.ts`) and put it *behind* the Worker (Worker serves assets + handles API).
        -   **Option B (Current):** Deploy as a Next.js app on Pages. You'll need to update the `API_BASE` in `dashboard/lib/api.ts` to point to your *deployed* Worker URL (e.g., `https://taichi-ni-agent.your-subdomain.workers.dev/api`).

## Configuring for Production (Option B)

1.  Update `dashboard/lib/api.ts`:
    ```typescript
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
    ```
2.  In Cloudflare Pages Settings > Environment Variables:
    -   Add `NEXT_PUBLIC_API_URL` = `https://<YOUR_WORKER_URL>/api`

## Verify

After deployment, visit your Pages URL and try logging in.
