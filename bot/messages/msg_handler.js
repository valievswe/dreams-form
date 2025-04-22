const { Markup } = require("telegraf");
const { getUserRegistrations } = require("../../services/registrationInfo");
const axios = require("axios");

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

async function handleMessage(message, ctx, isAdmin, keyboard, users) {
  const userId = ctx.from.id; // Corrected: using ctx.from.id instead of msg.from.id

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
                  url: "https://bot-form-8ebc37fceeb6.herokuapp.com/maktab",
                },
              },
            ],
            [
              {
                text: "Prezident maktabi uchun qabul",
                web_app: {
                  url: "https://bot-form-8ebc37fceeb6.herokuapp.com/president",
                },
              },
            ],
            [
              {
                text: "Mental arifmetika",
                web_app: {
                  url: "https://bot-form-8ebc37fceeb6.herokuapp.com/mental",
                },
              },
            ],
            [
              {
                text: "DTM test imtihonlari",
                web_app: {
                  url: "https://bot-form-8ebc37fceeb6.herokuapp.com/imtihon",
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
          await ctx.sendChatAction("upload_document");
          const response = await axios.post(
            `https://bot-form-8ebc37fceeb6.herokuapp.com/barchasi`,
            { telegram_id: ctx.from.id.toString() }, // Corrected: using ctx.from.id
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

    case "Mening ma'lumotlarim": {
      const telegramId = ctx.from.id; // Corrected: using ctx.from.id

      try {
        await ctx.sendChatAction("typing");
        const registrations = await getUserRegistrations(telegramId);

        if (
          !registrations.dtm &&
          !registrations.maktab &&
          !registrations.mental &&
          !registrations.president
        ) {
          return ctx.reply(
            "Siz hali ro'yxatdan o'tmagansiz. Iltimos, admin bilan bog'laning."
          );
        }

        let message = "📝 Ro'yhatdan o'tganligi haqida ma'lumot:\n\n";

        if (registrations.dtm) {
          const r = registrations.dtm;
          message += `📚 *DTM Imtihon*\n👤 Ism: ${
            r.fullname
          }\n📅 Tug‘ilgan sana: ${formatDate(r.dob)}\n📞 Tel: ${
            r.phone
          }\n📖 Fan: ${r.subject}\n\n`;
        }

        if (registrations.maktab) {
          const r = registrations.maktab;
          message += `🏫 *Dreams School Maktabi uchun*\n👤 Ism: ${
            r.fullname
          }\n📅 Tug‘ilgan sana: ${formatDate(r.dob)}\n📍 Joylashuv: ${
            r.location
          }\n🏫 Avvalgi maktab: ${r.previous_school}\n📚 Sinf: ${
            r.grade
          }\n📞 Tel: ${r.phone}\n\n`;
        }

        if (registrations.mental) {
          const r = registrations.mental;
          message += `🧠 *Mental Arifmetika*\n👤 Ism: ${
            r.fullname
          }\n📅 Tug‘ilgan sana: ${formatDate(r.dob)}\n📍 Joylashuv: ${
            r.location
          }\n📞 Tel: ${r.phone}\n📈 Daraja: ${r.level}\n\n`;
        }

        if (registrations.president) {
          const r = registrations.president;
          message += `👑 *President Maktabi tayyorlov*\n👤 Ism: ${
            r.fullname
          }\n📅 Tug‘ilgan sana: ${formatDate(r.dob)}\n📍 Joylashuv: ${
            r.location
          }\n📞 Tel: ${r.phone}\n📚 Hozirgi sinf: ${r.current_grade}\n\n`;
        }

        return ctx.reply(message, { parse_mode: "Markdown" });
      } catch (err) {
        console.error("❌ Error fetching registration data:", err);
        return ctx.reply(
          "Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring."
        );
      }
    }

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
