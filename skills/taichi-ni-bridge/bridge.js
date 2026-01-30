export async function onMessage(message, context) {
  const text = message.text.trim();

  if (text.startsWith('/setkey')) {
    const parts = text.split(' ');
    if (parts.length !== 2) {
      return context.reply('Usage: /setkey <sk-taichi-xxx>');
    }

    const key = parts[1];
    if (!key.startsWith('sk-taichi-')) {
      return context.reply('Invalid key format. Key must start with "sk-taichi-".');
    }

    // Store key in user state
    context.state.apiKey = key;
    return context.reply('API key set successfully! You can now start chatting.');
  }
}