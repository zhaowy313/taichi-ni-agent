# Specification: OpenClawd Bridge Skill

## Overview
This track focuses on creating the OpenClawd "Skill" that bridges end-users (on Telegram/Discord) to the TaiChi-NiHaixia Agent's Cloudflare Proxy. It handles user command parsing (triggers), API key binding (`/setkey`), and forwarding chat messages to the proxy.

## Functional Requirements
- **Skill Definition:** Create `SKILL.md` defining triggers (e.g., "TaiChi", "NiHaixia", "training") and permissions.
- **API Key Binding:** Implement a `/setkey <sk-taichi-xxx>` command.
    -   Store the association between the OpenClawd `user_id` and the provided API Key.
    -   Use OpenClawd's persistent storage (user state) or an external call to our Cloudflare Worker to validate/store this binding. *Decision: For MVP, store in OpenClawd's local user state.*
- **Message Bridging:** Implement `bridge.js` `onMessage` handler.
    -   Check if user has a bound API key.
    -   If no key, prompt user to register/set key.
    -   If key exists, forward the user's message to the Cloudflare Proxy (`/v1/chat/completions`).
    -   Return the proxy's response to the user.
- **Error Handling:** Handle network errors, 401 (invalid key), and 402 (insufficient balance) from the proxy and display user-friendly messages.

## Tech Stack
- **Framework:** OpenClawd Skill (JavaScript/Node.js environment).
- **Target Proxy:** The Cloudflare Worker URL from the previous track (local dev URL or deployed URL).

## Integration Points
- **Input:** User text messages via OpenClawd.
- **Output:** AI responses or system prompts (e.g., "Please set your key").
- **Backend:** Cloudflare Proxy (`/v1/chat/completions`).
