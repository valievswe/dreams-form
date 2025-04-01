// bot.js
const { Telegraf } = require("telegraf");
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const {
  handleMessage,
  handleCallbackQuery,
} = require("./messages/msg_handler");
const { getKeyboardForUser } = require("./buttons/inline_key");

// Load admin IDs from .env and split them into an array
const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(",").map((id) => id.trim())
  : [];
if (ADMIN_IDS.length === 0) {
  console.warn(
    "No ADMIN_IDS defined in .env. Admin features will be disabled."
  );
}

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be provided in .env file");
}

const bot = new Telegraf(BOT_TOKEN);

// Store user data (in-memory for simplicity; use a database in production)
const users = new Map();

// Check if user is admin
const isAdmin = (userId) => ADMIN_IDS.includes(userId.toString());

const startBot = async () => {
  try {
    // Start command with conditional keyboard
    bot.start((ctx) => {
      const userId = ctx.from.id;
      const userInfo = {
        username: ctx.from.username || "N/A",
        firstName: ctx.from.first_name || "N/A",
        lastName: ctx.from.last_name || "N/A",
        timestamp: new Date().toISOString(),
      };
      users.set(userId, userInfo);

      const keyboard = getKeyboardForUser(userId);
      ctx.reply("Welcome to the bot! Please select an option:", {
        reply_markup: keyboard,
      });
    });

    // Help command
    bot.help((ctx) => {
      const userId = ctx.from.id;
      const keyboard = getKeyboardForUser(userId);
      ctx.reply(
        "This bot is connected to a Telegram Mini App. Use the keyboard below to navigate.",
        { reply_markup: keyboard }
      );
    });

    // Handle text messages (including keyboard inputs)
    bot.on("text", (ctx) => {
      const userId = ctx.from.id;
      const userMessage = ctx.message.text;
      const keyboard = getKeyboardForUser(userId);
      const isUserAdmin = isAdmin(userId);

      // Use the handler from msg_handler.js
      handleMessage(userMessage, ctx, isUserAdmin, keyboard, users);
    });

    // Handle inline keyboard button presses (for admissionKeyboard)
    bot.on("callback_query", (ctx) => {
      const userId = ctx.from.id;
      const data = ctx.callbackQuery.data;
      const keyboard = getKeyboardForUser(userId);

      // Use the callback handler from msg_handler.js
      handleCallbackQuery(ctx, data, keyboard);
    });

    // Launch the bot
    await bot.launch();
    console.log("Telegram bot is running");

    // Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));

    return bot;
  } catch (error) {
    console.error("Bot error:", error);
    throw error;
  }
};

module.exports = { startBot };
