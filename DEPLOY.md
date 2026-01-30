# Deployment Guide: TaiChi-NiHaixia Agent

This guide outlines the steps to deploy the agent to Cloudflare Workers.

## Prerequisites

- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed (`npm install -g wrangler`).
- A Cloudflare account.

## Step 1: Login to Cloudflare

Authenticate Wrangler with your Cloudflare account:

```bash
npx wrangler login
```

## Step 2: Create Cloudflare Resources

You need to create the D1 database and KV namespace in your Cloudflare account.

### 2.1 Create D1 Database

```bash
npx wrangler d1 create taichi-db
```

**Action:** Copy the `database_id` from the output and update your `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "taichi-db"
database_id = "<PASTE_YOUR_DATABASE_ID_HERE>"
```

### 2.2 Create KV Namespace

```bash
npx wrangler kv:namespace create "KV"
```

**Action:** Copy the `id` from the output and update your `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV"
id = "<PASTE_YOUR_KV_ID_HERE>"
```

### 2.3 Create Vectorize Index

```bash
npx wrangler vectorize create taichi-knowledge-base --dimensions=1024 --metric=cosine
```

**Action:** Copy the configuration output and ensure your `wrangler.toml` matches. It should look like:

```toml
[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "taichi-knowledge-base"
```

## Step 3: Initialize Database Schema

Apply the schema to your remote D1 database:

```bash
npx wrangler d1 execute taichi-db --file=./schema.sql
```

## Step 4: Set Secrets

Set the `ADMIN_SECRET` for production:

```bash
npx wrangler secret put ADMIN_SECRET
# Enter a secure password when prompted
```

## Step 5: Deploy

Deploy your Worker to the edge:

```bash
npx wrangler deploy
```

**Success:** You should see your deployed URL (e.g., `https://taichi-ni-agent.your-subdomain.workers.dev`).

## Step 6: Verify

Use the `verify_prod.sh` script (created in the next step) or `curl` commands to verify your deployment.