// D&D Pipeline Relay Bot
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

if (!DISCORD_BOT_TOKEN) {
  console.error('DISCORD_BOT_TOKEN is not set. Add it in Railway > Variables and redeploy.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once('ready', () => {
  console.log(`Relay bot online as ${client.user.tag}, watching channel ${CHANNEL_ID}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== CHANNEL_ID) return;
  if (!message.content || !message.content.trim()) return;

  console.log(`Forwarding message from ${message.author.username}: ${message.content}`);

  try {
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message.content,
        author: message.author.username,
        channel_id: message.channelId,
      }),
    });
    if (!res.ok) {
      console.error(`Webhook call failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error('Failed to forward message to Make webhook:', err);
  }
});

client.login(DISCORD_BOT_TOKEN);
