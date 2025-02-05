const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const { getKeyboard } = require("../utils/keyboard");
const { commandHandler } = require("../handlers/commandHandler");
const { userStates } = require("../utils/stateManager");
const callbackHandler = require("../handlers/callbackHandler");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log("🤖 Bot is running...");

// Define command handler for specific commands
bot.onText(
  /^(📑 Registratsiya|📚 DTM|📞 Biz bilan bog'lanish|📍 Manzilimiz|🗑 O'chirish|📋 Barcha foydalanuvchilar|stop)$/,
  async (msg) => {
    try {
      await commandHandler(msg, bot); // Pass bot instance to commandHandler
    } catch (error) {
      console.error("Error handling command:", error);
      bot.sendMessage(msg.chat.id, "An error occurred. Please try again.");
    }
  }
);

// Define callback handler
bot.on("callback_query", async (query) => {
  try {
    await callbackHandler(userStates, bot)(query);
  } catch (error) {
    console.error("Error handling callback query:", error);
    bot.answerCallbackQuery(query.id, {
      text: "An error occurred. Please try again.",
    });
  }
});

// Define start command with keyboard
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Brini tanlang:", getKeyboard(chatId));
});

// Handling non-command messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if the user is in an ongoing registration process
  const currentState = userStates[chatId];

  if (currentState) {
    // If the user is in a state (e.g., awaiting name, phone, etc.),
    // forward the message to the commandHandler to handle the state
    try {
      await commandHandler(msg, bot);
    } catch (error) {
      console.error("Error handling message:", error);
      bot.sendMessage(chatId, "An error occurred. Please try again.");
    }
  }
});

// Error handling for polling
bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

module.exports = bot;
