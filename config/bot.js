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
      await commandHandler(msg, bot);
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

  const helloMessage = `Assalomu alaykum! 🌟 Bu bot orqali Dreams School maktabiga ro'yxatdan o'tasiz.

  Boshlash uchun 📑 Registratsiya buyrug'ini tanlang va quyidagi ma'lumotlarni kiriting:
1. 👤 To'liq ismingiz
2. 📅 Tug'ilgan sanangiz
3. 📞 Telefon raqamingiz
4. 🏠 Qayerdan ekanligingiz
5. 🏫 Qaysi maktabda o'qir edingiz
6. 🎓 Qaysi sinfga kirmoqdasiz
7. 📞 Qo'shimcha telefon raqamingiz

Yordam uchun +998959000407 yoki +998912000190 raqamlariga murojaat qiling.`;

  bot.sendMessage(chatId, helloMessage, getKeyboard(chatId));
});

// Add special handler for contact messages
bot.on("contact", async (msg) => {
  const chatId = msg.chat.id;
  const currentState = userStates[chatId];

  console.log("Received contact message:", msg.contact);

  if (currentState?.state === "AWAITING_PHONE") {
    try {
      // Pass the entire message to commandHandler - it has contact handling logic
      await commandHandler(msg, bot);
    } catch (error) {
      console.error("Error handling contact message:", error);
      bot.sendMessage(chatId, "An error occurred. Please try again.");
    }
  }
});

// Handling non-command messages (only for registration process)
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const currentState = userStates[chatId];

  // Skip contact messages - they're handled by the contact handler above
  if (msg.contact) {
    return;
  }

  // Only process messages if:
  // 1. User is in a state AND
  // 2. Message has text AND
  // 3. Message doesn't match command regex
  if (
    currentState &&
    text && // Add this check to ensure text is defined
    !text.match(
      /^(📑 Registratsiya|📚 DTM|📞 Biz bilan bog'lanish|📍 Manzilimiz|🗑 O'chirish|📋 Barcha foydalanuvchilar|stop)$/
    )
  ) {
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
