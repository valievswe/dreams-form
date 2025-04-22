// messages/msg_handler.js
const { Markup } = require("telegraf");
const { getUserRegistrations } = require("../../services/registrationInfo");
const axios = require("axios");

/**
 * Handles incoming messages and returns appropriate responses.
 * @param {string} message - The incoming message from the user.
 * @param {Object} ctx - The Telegram context object.
 * @param {boolean} isAdmin - Whether the user is an admin.
 * @param {Object} keyboard - The keyboard to display to the user.
 * @param {Map} users - The map of users.
 */
async function handleMessage(message, ctx, isAdmin, keyboard, users) {
  const userId = ctx.from.id;

  // Update user info in the users Map
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
      // Send a reply with multiple inline web buttons for different options
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
            `https://2235-213-230-82-78.ngrok-free.app/barchasi`, // Removed extra space
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
      } else {
        await ctx.reply("Sizda bu amalni bajarish huquqi yo'q.", {
          reply_markup: keyboard,
        });
      }
      break;

    case "Mening ma'lumotlarim":
      try {
        const registrations = await getUserRegistrations(userId); // Get the user registrations

        if (
          !registrations.dtm &&
          !registrations.maktab &&
          !registrations.mental &&
          !registrations.president
        ) {
          return ctx.reply(
            "Siz hech bir tanlovga ro'yxatdan o'tmagansiz. Iltimos, admin bilan bog'laning."
          );
        }

        let message = "📝 Sizning ro'yxatdan o'tgan tanlovlaringiz:\n\n";

        if (registrations.dtm) {
          const r = registrations.dtm;
          message += `📚 *DTM*\n👤 Ism: ${r.fullname}\n📅 Tug‘ilgan sana: ${r.dob}\n📞 Tel: ${r.phone}\n📖 Fan: ${r.subject}\n\n`;
        }

        if (registrations.maktab) {
          const r = registrations.maktab;
          message += `🏫 *Maktab*\n👤 Ism: ${r.fullname}\n📅 Tug‘ilgan sana: ${r.dob}\n📍 Joylashuv: ${r.location}\n🏫 Avvalgi maktab: ${r.previous_school}\n📚 Sinf: ${r.grade}\n📞 Tel: ${r.phone}\n\n`;
        }

        if (registrations.mental) {
          const r = registrations.mental;
          message += `🧠 *Mental*\n👤 Ism: ${r.fullname}\n📅 Tug‘ilgan sana: ${r.dob}\n📍 Joylashuv: ${r.location}\n📞 Tel: ${r.phone}\n📈 Daraja: ${r.level}\n\n`;
        }

        if (registrations.president) {
          const r = registrations.president;
          message += `👑 *President maktabi*\n👤 Ism: ${r.fullname}\n📅 Tug‘ilgan sana: ${r.dob}\n📍 Joylashuv: ${r.location}\n📞 Tel: ${r.phone}\n📚 Hozirgi sinf: ${r.current_grade}\n\n`;
        }

        await ctx.reply(message, { parse_mode: "Markdown" });
      } catch (err) {
        console.error("❌ Error fetching registration data:", err);
        await ctx.reply("Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
      }
      break;

    default:
      // Handle any other message with a simple response
      const response = handleSimpleMessage(message);
      ctx.reply(response, { reply_markup: keyboard });
      break;
  }
}

/**
 * Handles simple messages that don't require complex logic.
 * @param {string} message - The incoming message from the user.
 * @returns {string} - The response to send to the user.
 */
function handleSimpleMessage(message) {
  // You can customize this logic based on your needs.
  return `Siz yuborgan xabar: ${message}`;
}

// Export the handler functions for use in other files
module.exports = {
  handleMessage,
};
