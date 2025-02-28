const { userStates, STATES } = require("../utils/stateManager");
const {
  createUser,
  getUsersWithPagination,
  generateAllUsersExcel,
} = require("../controllers/UserController");
const User = require("../models/User");
const { isAdmin } = require("../utils/auth"); // Import the isAdmin function
const { getKeyboard } = require("../utils/keyboard"); // Import the getKeyboard function
const path = require("path"); // Import the path module
const fs = require("fs"); // Import the fs module

const commandHandler = async (msg, bot) => {
  const chatId = msg.chat.id;
  const text = msg.text || ""; // Ensure text is always a string
  const currentState = userStates[chatId];

  console.log("Received message:", text); // Debugging: Log the received message

  // Handle /stop or "stop" command
  if (text.toLowerCase() === "/stop" || text.toLowerCase() === "stop") {
    await bot.sendMessage(chatId, "Jarayon bekor qilindi.");
    delete userStates[chatId]; // Clear the user's state
    return;
  }

  // Handle commands based on text input
  switch (text) {
    case "/start":
      bot.sendMessage(chatId, "Brini tanlang:", getKeyboard(chatId));
      break;

    case "📚 DTM":
      bot.sendMessage(
        chatId,
        "📚 Bu funksiya hozircha ishlamaydi iltimos adminga bog'laning +998959000407 yoki +998912000190"
      );
      break;

    case "📑 Registratsiya":
      bot.sendMessage(chatId, "❌ To'xtatish uchun 'stop' ni yuboring");
      userStates[chatId] = { state: STATES.AWAITING_NAME, data: {} };
      bot.sendMessage(chatId, "Iltimos, to‘liq ismingizni kiriting:");
      break;

    case "📞 Biz bilan bog'lanish":
      bot.sendMessage(
        chatId,
        "Biz bilan bog'lanish uchun quyidagi raqamga qo'ng'iroq qiling: +998959000407 +998912000190"
      );
      break;

    case "📍 Manzilimiz":
      bot.sendMessage(
        chatId,
        "Bizning manzil: [Dreams School](https://maps.app.goo.gl/bJJDFhc3p3hWdaRQ7)"
      );
      break;

    case "🗑 O'chirish":
      if (isAdmin(chatId)) {
        await displayUsersAsButtons(chatId, bot);
      } else {
        bot.sendMessage(chatId, "❌ Siz admin emassiz.");
      }
      break;

    case "📋 Barcha foydalanuvchilar":
      if (isAdmin(chatId)) {
        try {
          const filePath = await generateAllUsersExcel();

          if (fs.existsSync(filePath)) {
            // Send the Excel file
            await bot.sendDocument(chatId, filePath, {
              caption: "Barcha foydalanuvchilar ro'yxati",
              filename: "students_list.xlsx",
            });

            // Delete the file after sending
            fs.unlinkSync(filePath);
          } else {
            bot.sendMessage(chatId, "Fayl yaratishda xatolik yuz berdi.");
          }
        } catch (error) {
          console.error("Error handling Excel file:", error);
          bot.sendMessage(
            chatId,
            "Faylni yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring."
          );
        }
      } else {
        bot.sendMessage(chatId, "❌ Siz admin emassiz.");
      }
      break;

    default:
      // Handle state-based inputs
      if (!currentState) {
        bot.sendMessage(
          chatId,
          "⚠️ Noma’lum buyruq yoki ro‘yxatdan o‘tish yakunlanmagan."
        );
        return;
      }

      switch (currentState.state) {
        case STATES.AWAITING_NAME:
          userStates[chatId].data.fullName = text;
          userStates[chatId].state = STATES.AWAITING_PHONE;

          // Ask for phone number (with contact sharing button)
          bot.sendMessage(chatId, "Iltimos, telefon raqamingizni kiriting:", {
            reply_markup: {
              keyboard: [
                [
                  {
                    text: "📞 Telefon raqamimni ulashish",
                    request_contact: true,
                  },
                ],
              ],
              one_time_keyboard: true,
              resize_keyboard: true,
            },
          });
          break;

        case STATES.AWAITING_PHONE:
          let phoneNumber = null;

          if (msg.contact) {
            phoneNumber = msg.contact.phone_number; // Phone number from contact sharing
          } else if (/^\+?\d{9,15}$/.test(text)) {
            phoneNumber = text; // Manually entered phone number
          } else {
            bot.sendMessage(
              chatId,
              "❌ Noto‘g‘ri telefon raqami. Iltimos, qaytadan kiriting yoki kontaktni ulashing."
            );
            return;
          }

          // Check if phone number already exists
          const existingUser = await User.findByPhone(phoneNumber);
          if (existingUser) {
            bot.sendMessage(
              chatId,
              "❌ Ushbu telefon raqami allaqachon ro‘yxatdan o‘tgan. Iltimos yangi raqam bilan ro‘yxatdan o‘ting."
            );
            return;
          }

          userStates[chatId].data.phone = phoneNumber;
          userStates[chatId].state = STATES.AWAITING_FROM_WHERE;
          bot.sendMessage(chatId, "Qayerdansiz, yashash joyingiz?");
          break;

        case STATES.AWAITING_FROM_WHERE:
          userStates[chatId].data.fromWhere = text;
          userStates[chatId].state = STATES.AWAITING_SCHOOL;
          bot.sendMessage(chatId, "Maktabingiz nomini kiriting:");
          break;

        case STATES.AWAITING_SCHOOL:
          if (!text.trim()) {
            bot.sendMessage(
              chatId,
              "❌ Maktab nomi bo‘sh bo‘lishi mumkin emas. Iltimos, qaytadan kiriting:"
            );
            return;
          }

          userStates[chatId].data.school = text;
          userStates[chatId].state = STATES.AWAITING_GRADE;

          // Display list of grades as inline buttons
          const grades = [
            "0 (Maktabga tayyorlov)",
            "1-sinf",
            "2-sinf",
            "3-sinf",
            "4-sinf",
            "5-sinf",
            "6-sinf",
            "7-sinf",
            "8-sinf",
            "9-sinf",
            "10-sinf",
            "11-sinf",
          ];

          const gradeButtons = grades.map((grade) => ({
            text: grade,
            callback_data: `grade_${grade}`,
          }));

          bot.sendMessage(
            chatId,
            "Siz qaysi sinf uchun ro‘yxatdan o‘tyapsiz?",
            {
              reply_markup: {
                inline_keyboard: gradeButtons.map((button) => [button]),
              },
            }
          );
          break;

        case STATES.AWAITING_DATE_OF_BIRTH:
          if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            bot.sendMessage(
              chatId,
              "❌ Tug‘ilgan kun formati noto‘g‘ri. Iltimos, YYYY-MM-DD formatida kiriting."
            );
            return;
          }

          // Validate the date
          const date = new Date(text);
          if (isNaN(date.getTime())) {
            bot.sendMessage(
              chatId,
              "❌ Tug‘ilgan sana noto‘g‘ri. Iltimos, haqiqiy sanani kiriting."
            );
            return;
          }

          userStates[chatId].data.dateOfBirth = text;
          userStates[chatId].state = STATES.AWAITING_ADDITIONAL_PHONE;
          bot.sendMessage(chatId, "Qo‘shimcha telefon raqamingizni kiriting:");
          break;

        case STATES.AWAITING_ADDITIONAL_PHONE:
          userStates[chatId].data.additionalPhone = text || null;
          userStates[chatId].state = STATES.AWAITING_CONFIRMATION;

          // Display user data for confirmation
          const userData = userStates[chatId].data;
          bot.sendMessage(
            chatId,
            `🔍 Iltimos, ma’lumotlaringizni tekshiring:\n\n` +
              `📛 To‘liq ism: ${userData.fullName}\n` +
              `📞 Telefon: ${userData.phone}\n` +
              `🏡 Qayerdan: ${userData.fromWhere}\n` +
              `🏫 Maktab: ${userData.school}\n` +
              `🎓 Sinf: ${userData.entranceGrade}\n` +
              `🎂 Tug‘ilgan sana: ${userData.dateOfBirth}\n` +
              `📞 Qo‘shimcha telefon: ${
                userData.additionalPhone || "Yo‘q"
              }\n\n` +
              `✅ Davom etish uchun "Tasdiqlash" ni bosing yoki bekor qilish uchun "Bekor qilish" ni bosing.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "Tasdiqlash", callback_data: "confirm" }],
                  [{ text: "Bekor qilish", callback_data: "cancel" }],
                ],
              },
            }
          );
          break;

        default:
          bot.sendMessage(
            chatId,
            "⚠️ Noma’lum buyruq yoki ro‘yxatdan o‘tish yakunlanmagan."
          );
          break;
      }
      break;
  }
};

module.exports = { commandHandler };
