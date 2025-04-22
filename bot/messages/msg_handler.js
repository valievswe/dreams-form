/**
 * Handles incoming messages and returns appropriate responses.
 * @param {string} message - The incoming message from the user.
 * @param {Object} ctx - The Telegram context object.
 * @param {boolean} isAdmin - Whether the user is an admin.
 * @param {Object} keyboard - The keyboard to display to the user.
 * @param {Map} users - The map of users.
 */
const { Markup } = require("telegraf");

const axios = require("axios");

async function handleMessage(message, ctx, isAdmin, keyboard, users) {
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
                text: "Maktab uchun qabul",
                web_app: {
                  url: "https://2235-213-230-82-78.ngrok-free.app/maktab",
                },
              },
            ],
            [
              {
                text: "Prezident maktabi uchun qabul",
                web_app: {
                  url: "https://2235-213-230-82-78.ngrok-free.app/president",
                },
              },
            ],
            [
              {
                text: "Mental arifmetika",
                web_app: {
                  url: "https://2235-213-230-82-78.ngrok-free.app/mental",
                },
              },
            ],
            [
              {
                text: "DTM test imtihonlari",
                web_app: {
                  url: "https://2235-213-230-82-78.ngrok-free.app/imtihon",
                },
              },
            ],
          ],
        },
      });
      break;

    case "Ma'lumotlarni olish":
      if (isAdmin) {
        try {
          const response = await axios.post(
            `https://2235-213-230-82-78.ngrok-free.app/barchasi`, // Remove space
            { telegram_id: ctx.from.id.toString() },
            {
              responseType: "arraybuffer",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          await ctx.replyWithDocument({
            source: response.data,
            filename: "barchasi.xlsx",
          });
        } catch (err) {
          console.error("Full error:", err.response?.data || err.message);
          await ctx.reply(
            `❌ Xatolik: ${err.response?.data?.error || "Server xatosi"}`
          );
        }
      }
      break;

    case "Mening ma'lumotlarim":
      const user = users.get(userId);
      if (user) {
        const userInfoMessage =
          `Sizning ma'lumotlaringiz:\n\n` +
          `Ism: ${user.firstName}\n` +
          `Familiya: ${user.lastName}\n` +
          `Telegram ID: ${userId}\n` +
          `Vaqt: ${user.timestamp}`;
        ctx.reply(userInfoMessage, { reply_markup: keyboard });
      } else {
        ctx.reply("Sizning ma'lumotlaringiz topilmadi.", {
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

// Export the handler functions for use in other files
module.exports = {
  handleMessage,
};
