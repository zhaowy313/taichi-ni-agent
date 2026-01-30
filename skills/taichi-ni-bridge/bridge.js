// Cloudflare Proxy URL (Update this after deployment or for local testing)
const PROXY_URL = 'https://taichi-ni-agent.your-subdomain.workers.dev/v1/chat/completions';

export async function onMessage(message, context) {
  const text = message.text.trim();

  // Handle Commands
  if (text.startsWith('/setkey')) {
    const parts = text.split(' ');
    if (parts.length !== 2) {
      return context.reply('Usage: /setkey <sk-taichi-xxx>');
    }

    const key = parts[1];
    if (!key.startsWith('sk-taichi-')) {
      return context.reply('Invalid key format. Key must start with "sk-taichi-".');
    }

    context.state.apiKey = key;
    return context.reply('API key set successfully! You can now start chatting about TaiChi or Ni Haixia.');
  }

  // Handle Chat Messages
  if (!context.state.apiKey) {
    return context.reply('Please set your API key first using `/setkey <sk-taichi-xxx>`. You can get one at https://your-domain.com');
  }

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.state.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: text }]
      })
    });

    if (response.status === 401) {
      return context.reply('Invalid API key. Please check your key and set it again with `/setkey`.');
    }

    if (response.status === 402) {
      return context.reply('You have insufficient balance. Please recharge your account.');
    }

    if (!response.ok) {
      return context.reply('The service is currently unavailable. Please try again later.');
    }

    const data = await response.json();
    const advice = data.choices[0].message.content;
    const usage = data.usage;

    return context.reply(`${advice}\n\n(Tokens used: ${usage.total_tokens})`);
  } catch (error) {
    console.error('Bridge Error:', error);
    return context.reply('Sorry, I encountered an error connecting to the health agent.');
  }
}