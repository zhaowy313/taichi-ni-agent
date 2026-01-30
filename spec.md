以下是一個完整的 spec.md 文件內容，你可以直接複製到你的項目根目錄（或 docs/ 目錄）作為開發說明文檔。這個 spec 假設你的核心智能體（太極拳 + 倪海厦生活方式建議）已經存在（或正在開發），現在先用 Cloudflare AI Gateway 搭建一個 空殼代理（proxy shell），暴露 OpenAI-compatible 的 API 端點，同時完成 API Key 管理、按 tokens 計費、與 OpenClawd Skills 的集成。文件採用 Markdown 格式，結構清晰，便於團隊閱讀或作為 GitHub README 的補充。markdown
# TaiChi-NiHaixia Agent 開發規格說明 (spec.md)

**項目代號**：TaiChiNi  
**最新更新**：2026-01-30  
**目標**：構建一個陪伴式太極拳訓練 + 倪海厦生活方式建議智能體，透過社交媒體（OpenClawd 集成）提供服務。  
核心原則：數據主權在用戶側 + 服務端收費 + 低延遲邊緣部署。

## 1. 項目階段與當前假設

- **階段**：MVP（Minimum Viable Product） - 空殼代理階段  
- **假設**：
  - 核心智能體（fine-tuned 模型 / RAG + LoRA）尚未完全就位，或部署在外部（如自建 vLLM、Together AI、Hugging Face 等）。
  - 先用 Cloudflare AI Gateway 搭建一個 **OpenAI-compatible 的代理殼**（proxy shell），路由到任意後端（可先用 Workers AI 的公開模型做 placeholder）。
  - 後續替換成你的自有模型端點。
- **不包含**：模型訓練、fine-tune、RAG 知識庫建置（假設已獨立完成）。

## 2. 系統架構概覽
用戶 (Telegram / WhatsApp / Discord 等)
          ↓
OpenClawd (本地或 Cloudflare Moltworker 部署)
          ↓ (fetch + Authorization: Bearer sk-xxx)
你的 AI Gateway Proxy (Cloudflare Worker + AI Gateway)
          ↓ (proxy + observability + rate limit)
後端模型提供者占位：Cloudflare Workers AI (@cf
/meta/llama-3.x 等)
未來：你的 fine-tuned 模型 (Custom Provider)
  ↓

計費系統 (Stripe + 自建餘額/DB)API Key 驗證
Tokens 計數與扣費
## 3. Cloudflare AI Gateway 空殼實現

### 3.1 目標
- 暴露一個統一的 `/v1/chat/completions` 端點（OpenAI 兼容）。
- 支持 Custom Provider：代理到你的外部模型。
- 利用 AI Gateway 的 caching、rate limiting、logs、cost tracking。

### 3.2 步驟（Dashboard 操作 + Wrangler）

1. **創建 AI Gateway**
   - Dashboard → AI → AI Gateway → Create Gateway
   - 名稱：`taichi-ni-agent-gateway`
   - 啟用：Caching (TTL 適中)、Rate Limiting (e.g. 每分鐘 60 req/user)、Logs

2. **綁定 Provider**
   - 先用 Workers AI 作為 placeholder：
     - Provider：Workers AI
     - Model：@cf/meta/llama-3.3-70b-instruct 或類似
   - 未來切換 Custom Provider：
     - Endpoint：https://your-vllm-or-hf-endpoint/v1
     - Auth：Bearer YOUR_BACKEND_KEY
     - Headers：添加自定義（如 X-Model-Type: taichi）

3. **Gateway Endpoint**
   - 自動生成：https://gateway.ai.cloudflare.com/v1/{account_id}/taichi-ni-agent-gateway/openai
   - 完整 URL 示例：https://gateway.ai.cloudflare.com/v1/abc123def/taichi-ni-agent-gateway/openai/chat/completions

4. **Wrangler 配置（可選額外 Worker 包裝）**
   - 如果需要額外邏輯（如自訂 prompt 前處理），創建 Worker 代理 Gateway。

## 4. API Key 管理與按 Tokens 計費

### 4.1 API Key 格式與生成
- 前綴：`sk-taichi-`（區分你的服務）
- 生成：32-48 位隨機 hex（crypto.randomBytes）
- 存儲：Cloudflare D1 或 KV（哈希存儲，bcrypt）
- 關聯字段：user_id, created_at, expires_at, balance (USD decimal), status (active/revoked)

### 4.2 Tokens 計費邏輯
- 計費單位：Input Tokens + Output Tokens（blended）
- 定價示例（可調）：
  - Input：$1.2 / 1M tokens
  - Output：$4.8 / 1M tokens
  - 或統一：$3.5 / 1M tokens
- 扣費方式：**預付餘額**（推薦 MVP）
  - 用戶充值 → 存入 D1 balance
  - 每次請求後：
    1. 從 response.usage 取 input_tokens / output_tokens
    2. cost = (input * rate_in + output * rate_out) / 1_000_000
    3. balance -= cost
    4. 若 balance < 0.05 → 拒絕請求，返回 402 + 充值提示
- Stripe 集成（後續）：
  - 用 Stripe Billing Metered Prices + Usage Records 上報 tokens

### 4.3 驗證中間件（偽碼）
```ts
async function authAndCharge(request: Request, env: Env) {
  const key = getBearerToken(request);
  const user = await env.D1.getUserByKey(keyHash(key));
  if (!user || user.balance < 0.05) return unauthorizedOrPaymentRequired();

  // 代理到 Gateway 或直接 Workers AI
  const resp = await forwardToGateway(request);

  const { input_tokens, output_tokens } = resp.usage;
  const cost = calcCost(input_tokens, output_tokens);
  await env.D1.deductBalance(user.id, cost);

  return resp;
}

5. 集成到 OpenClawd Skills5.1 Skills 結構目錄：~/openclawd/skills/taichi-ni-bridge/
SKILL.md（YAML + Markdown）
```yamlname: TaiChiNiBridge
description: 太極拳 + 倪海厦生活方式陪伴助手（API 代理）
triggers: ["太極", "taichi", "倪海厦", "nihaixia", "养生", "训练"]
permissions: api:call_external, read:logs, write:reminders
5.2 bridge.js（核心調用邏輯）javascript
const GATEWAY_URL = 'https://gateway.ai.cloudflare.com/v1/{account}/taichi-ni-agent-gateway/openai/chat/completions';
const API_KEY_PREFIX = 'sk-taichi-';

export async function onMessage(message, context) {
  const userId = context.user.id;
  // 假設每個 OpenClawd 用戶有綁定你的 API Key（可存 KV 或 prompt 詢問）
  const userApiKey = await getUserApiKey(userId);  // 從你的 DB 或 context 取

  if (!userApiKey) {
    return context.reply('請先在 https://your-domain.com/register 註冊並獲取 API Key');
  }

  const prompt = buildPromptWithRAG(message.text, userId);  // 可選：注入用戶狀態

  const resp = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-instruct',  // 或你的 custom model
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800
    })
  });

  if (!resp.ok) {
    // 處理 401/402 等錯誤，提示充值
    return context.reply('服務暫不可用或餘額不足，請充值。');
  }

  const data = await resp.json();
  const advice = data.choices[0].message.content;
  const usage = data.usage;

  // 更新用戶日誌（陪伴式）
  await saveInteraction(userId, message.text, advice, usage);

  context.reply(advice + `\n\n本次消耗：${usage.total_tokens} tokens`);
}

5.3 用戶 Key 綁定方式（建議）OpenClawd 聊天中指令："/setkey sk-taichi-xxx"
存入 OpenClawd 的 user state 或你的後端 DB（透過另一個 API）。

6. 下一步 RoadmapMVP 上線（本 spec 完成）：空殼代理 + Key + 計費 + OpenClawd 集成
接入真模型：Custom Provider → 你的 fine-tuned endpoint
增強 RAG：用 Vectorize 存太極/倪海厦知識庫
用戶 Dashboard：Next.js + Vercel，顯示 Key、餘額、消費
營收優化：月訂閱 + 按量混合

7. 注意事項與風險成本：你付 Cloudflare Workers Paid $5/月起 + 超額 usage；用戶付給你 tokens 費。
安全：Key 哈希存儲、HTTPS 強制、rate limit 防刷。
延遲：AI Gateway + Workers 邊緣部署，通常 < 500ms。
合規：健康建議避免醫療診斷表述，添加免責聲明。

如需代碼模板、Wrangler.toml 示例或 Dashboard 截圖指引，請提供更多細節！ 開發愉快！
這個 spec.md 已經涵蓋了你提到的「空殼 + 收費 + API + OpenClawd 集成」，可以作為項目起點直接使用。如果你需要調整定價、添加更多細節（如 D1 schema），或轉成中文版，都可以告訴我再改。

