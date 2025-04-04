/**
 * Handles incoming messages and returns appropriate responses.
 * @param {string} message - The incoming message from the user.
 * @param {Object} ctx - The Telegram context object.
 * @param {boolean} isAdmin - Whether the user is an admin.
 * @param {Object} keyboard - The keyboard to display to the user.
 * @param {Map} users - The map of users.
 */
const { Markup } = require("telegraf");

function handleMessage(message, ctx, isAdmin, keyboard, users) {
  const userId = ctx.from.id;

  // Update user info
  const userInfo = {
    username: ctx.from.username || "N/A",
    firstName: ctx.from.first_name || "N/A",
    lastName: ctx.from.last_name || "N/A",
    timestamp: new Date().toISOString(),
  };
  users.set(userId, userInfo);

  // Handle specific keyboard inputs
  switch (message) {
    case "Maktab uchun qabul":
      ctx.reply("Maktab uchun qabul bo'limiga xush kelibsiz", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Ro'yxatdan o'tish",
                web_app: { url: "https://dd1f-213-230-82-192.ngrok-free.app/" },
              },
            ],
          ],
        },
      });
      break;
    case "Prezident maktabi uchun qabul":
      ctx.replyWithHTML(
        "Opening Prezident Maktabi form...\n<a href='https://dd1f-213-230-82-192.ngrok-free.app/prezident-m'>Click here</a>",
        { reply_markup: keyboard }
      );
      break;
    case "Mental arifmetika":
      ctx.replyWithHTML(
        "Opening Mental Arifmetika form...\n<a href='https://dd1f-213-230-82-192.ngrok-free.app/mental-m'>Click here</a>",
        { reply_markup: keyboard }
      );
      break;
    case "Test imtihonlari":
      ctx.replyWithHTML(
        "Opening Test Imtihonlari form...\n<a href='https://dd1f-213-230-82-192.ngrok-free.app/test-imtihon'>Click here</a>",
        { reply_markup: keyboard }
      );
      break;
    case "Qabul jarayoni":
      const { admissionKeyboard } = require("../buttons/inline_key");
      ctx.reply("Qabul jarayoni haqida ma'lumot:", {
        reply_markup: admissionKeyboard,
      });
      break;
    case "Testlar":
      ctx.reply("Testlar haqida ma'lumot kelajakda qo'shiladi.", {
        reply_markup: keyboard,
      });
      break;
    case "Yordam":
      ctx.reply(
        "Yordam bo'limi: Savollaringizni bu yerda so'rashingiz mumkin.",
        {
          reply_markup: keyboard,
        }
      );
      break;
    case "Ma'lumotlarni olish":
      if (isAdmin) {
        let userDataText = "Registered Users:\n";
        if (users.size === 0) {
          userDataText = "No users have interacted with the bot yet.";
        } else {
          users.forEach((info, id) => {
            userDataText += `\nID: ${id}\nUsername: @${info.username}\nName: ${info.firstName} ${info.lastName}\nLast Active: ${info.timestamp}\n`;
          });
        }
        ctx.reply(userDataText, { reply_markup: keyboard });
      } else {
        ctx.reply("This command is for admins only.", {
          reply_markup: keyboard,
        });
      }
      break;
    default:
      const response = handleSimpleMessage(message);
      ctx.reply(response, { reply_markup: keyboard });
      break;
  }
}

/**
 * Handles simple text messages and returns appropriate responses.
 * @param {string} message - The incoming message from the user.
 * @returns {string} - The bot's response.
 */
function handleSimpleMessage(message) {
  // Normalize the message (e.g., trim whitespace, convert to lowercase)
  const normalizedMessage = message.trim().toLowerCase();

  // Define responses for specific keywords or commands
  switch (normalizedMessage) {
    case "hello":
    case "hi":
      return "Salom! Qanday yordam bera olaman?";
    case "help":
      return "Men yordam bera oladigan mavzular: qabul jarayoni, testlar va boshqa savollar.";
    case "qabul":
      return "Qabul jarayoni haqida ma'lumot olish uchun maktab yo'nalishini tanlang.";
    case "rahmat":
      return "Arzimaydi! Yana savollaringiz bo'lsa, bemalol so'rang.";
    default:
      return "Kechirasiz, bu savolga javob bera olmayman. Iltimos, boshqa savol bering.";
  }
}

/**
 * Handles callback queries (inline keyboard buttons)
 * @param {Object} ctx - The Telegram context object.
 * @param {string} data - The callback data.
 * @param {Object} keyboard - The keyboard to display to the user.
 */
function handleCallbackQuery(ctx, data, keyboard) {
  switch (data) {
    case "school_admission":
      ctx.editMessageText("Maktab qabul jarayoni haqida ma'lumot...");
      break;
    case "president_admission":
      ctx.editMessageText(
        "Prezident maktabi qabul jarayoni haqida ma'lumot..."
      );
      break;
    case "back_to_main":
      ctx.editMessageText("Asosiy menyuga qaytish:", {
        reply_markup: keyboard,
      });
      break;
  }

  ctx.answerCbQuery();
}

// Export the handler functions for use in other files
module.exports = {
  handleMessage,
  handleSimpleMessage,
  handleCallbackQuery,
};
