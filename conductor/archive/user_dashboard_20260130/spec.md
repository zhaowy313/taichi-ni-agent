# Specification: User Dashboard (MVP)

## Overview
This track focuses on building a Minimum Viable Product (MVP) web dashboard for users. This dashboard will allow users to self-serve key management tasks that currently require admin intervention.

## Functional Requirements
- **User Authentication:** Simple email/password or magic link login (using Cloudflare D1 `users` table).
- **Dashboard Home:**
    -   Display current Balance.
    -   Display API Key (masked, with "Copy" button).
    -   "Generate New Key" button (if no key exists).
- **Top-up Request:** A simple form to request a balance top-up (for MVP, this might just send an email to admin or log a request).

## Tech Stack
- **Frontend:** Next.js (React) deployed on Cloudflare Pages.
- **Backend:** Existing Cloudflare Worker (we will add user-facing API endpoints).
- **Styling:** Tailwind CSS.

## Integration Points
- **API:** The dashboard will call the Cloudflare Worker endpoints (which we need to add/expose).
