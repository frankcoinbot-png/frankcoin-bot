const { Telegraf, Markup } = require('telegraf');
const { query } = require('./db');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;
if (!BOT_TOKEN) {
  console.warn('WARNING: TELEGRAM_BOT_TOKEN is not set.');
}
const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;

async function ensureUser(tg_id, username, ref) {
  await query(`SELECT ensure_user($1,$2,$3)`, [tg_id, username, ref || null]);
}

if (bot) {
  bot.start(async (ctx) => {
    const parts = (ctx.message.text || '').split(' ');
    let ref = null;
    if (parts.length > 1 && /^\d+$/.test(parts[1])) ref = Number(parts[1]);
    await ensureUser(ctx.from.id, ctx.from.username, ref);
    await ctx.reply(
      'Welcome to FRANKCOIN! Tap to earn and get premium perks.',
      Markup.inlineKeyboard([
        [Markup.button.webApp('Open FRANKCOIN', WEBAPP_URL)]
      ])
    );
  });

  bot.command('link', async (ctx) => {
    const deep = `https://t.me/${process.env.BOT_USERNAME}?start=${ctx.from.id}`;
    await ctx.reply(`Invite link:\n${deep}`);
  });

  bot.launch().then(()=>console.log('Bot launched')).catch(console.error);
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

module.exports = { bot, ensureUser };
