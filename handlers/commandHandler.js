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
  const text = msg.text;
  const currentState = userStates[chatId];

  console.log("Received message:", text); // Debugging: Log the received message

  if (text.toLowerCase() === "/stop" || text.toLowerCase() === "stop") {
    await bot.sendMessage(chatId, "Jarayon bekor qilindi.");
    return;
  }

  switch (text) {
    case "/start":
      bot.sendMessage(chatId, "Brini tanlang:", getKeyboard(chatId));
      break;

    case "📚 DTM":
      bot.sendMessage(
        chatId,
        "📚 Bu funksiya hozircha ishlamaydi iltimos adminga bog'laning +998959000407 yoki +998912000190 "
      );
      break;

    case "📑 Registratsiya":
      bot.sendMessage(chatId, "❌ To'xtatish uchun 'stop' ni yuboring");
      userStates[chatId] = { state: STATES.AWAITING_NAME, data: {} };
      bot.sendMessage(chatId, "Iltimos, to‘liq ismingizni kiriting:");
      break;

    case "📞 Biz bilan bog'lanish":
      console.log("Handling 'Biz bilan bog'lanish' command"); // Debugging: Log the command handling
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

    case "stop":
      delete userStates[chatId];
      bot.sendMessage(chatId, "📛 Ro‘yxatdan o‘tish bekor qilindi.");

      // Send updated command buttons
      bot.sendMessage(chatId, "🔙 Asosiy menyu:", getKeyboard(chatId));
      break;

    default:
      if (currentState?.state === STATES.AWAITING_NAME) {
        userStates[chatId].data.fullName = text;
        userStates[chatId].state = STATES.AWAITING_PHONE;

        // Telefon raqami so‘rash (tugma & qo‘lda kiritish)
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
      } else if (currentState?.state === STATES.AWAITING_PHONE) {
        let phoneNumber = null;

        if (msg.contact) {
          phoneNumber = msg.contact.phone_number; // Kontakt orqali olindi
        } else if (/^\d{9,15}$/.test(text)) {
          phoneNumber = text; // Foydalanuvchi qo‘lda to‘g‘ri telefon raqami kiritdi
        } else {
          bot.sendMessage(
            chatId,
            "❌ Noto‘g‘ri telefon raqami. Iltimos, qaytadan kiriting yoki kontaktni ulashing."
          );
          return;
        }

        // Telefon raqami oldindan mavjudligini tekshirish
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
      } else if (currentState?.state === STATES.AWAITING_FROM_WHERE) {
        userStates[chatId].data.fromWhere = text;
        userStates[chatId].state = STATES.AWAITING_SCHOOL;
        bot.sendMessage(chatId, "Maktabingiz nomini kiriting:");
      } else if (currentState?.state === STATES.AWAITING_SCHOOL) {
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
          {
            text: "0 (Maktabga tayyorlov)",
            callback_data: "grade_0 (Maktabga tayyorlov)",
          },
          { text: "1-sinf", callback_data: "grade_1-sinf" },
          { text: "2-sinf", callback_data: "grade_2-sinf" },
          { text: "3-sinf", callback_data: "grade_3-sinf" },
          { text: "4-sinf", callback_data: "grade_4-sinf" },
          { text: "5-sinf", callback_data: "grade_5-sinf" },
          { text: "6-sinf", callback_data: "grade_6-sinf" },
          { text: "7-sinf", callback_data: "grade_7-sinf" },
          { text: "8-sinf", callback_data: "grade_8-sinf" },
          { text: "9-sinf", callback_data: "grade_9-sinf" },
          { text: "10-sinf", callback_data: "grade_10-sinf" },
          { text: "11-sinf", callback_data: "grade_11-sinf" },
        ];

        bot.sendMessage(chatId, "Siz qaysi sinf uchun ro‘yxatdan o‘tyapsiz?", {
          reply_markup: {
            inline_keyboard: grades.map((grade) => [grade]),
          },
        });
      } else if (currentState?.state === STATES.AWAITING_DATE_OF_BIRTH) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
          bot.sendMessage(
            chatId,
            "❌ Tug‘ilgan kun formati noto‘g‘ri. Iltimos, YYYY-MM-DD formatida kiriting."
          );
          return;
        }

        // Sana haqiqiy ekanligini tekshirish
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
      } else if (currentState?.state === STATES.AWAITING_ADDITIONAL_PHONE) {
        userStates[chatId].data.additionalPhone = text || null;
        userStates[chatId].state = STATES.AWAITING_CONFIRMATION;

        // Ma'lumotlarni tasdiqlashdan oldin ko‘rsatish
        const userData = userStates[chatId].data;
        console.log(userData);

        bot.sendMessage(
          chatId,
          `🔍 Iltimos, ma’lumotlaringizni tekshiring:\n\n` +
            `📛 To‘liq ism: ${userData.fullName}\n` +
            `📞 Telefon: ${userData.phone}\n` +
            `🏡 Qayerdan: ${userData.fromWhere}\n` +
            `🏫 Maktab: ${userData.school}\n` +
            `🎓 Sinf: ${userData.entranceGrade}\n` +
            `🎂 Tug‘ilgan sana: ${userData.dateOfBirth}\n` +
            `📞 Qo‘shimcha telefon: ${userData.additionalPhone || "Yo‘q"}\n\n` +
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
      } else {
        bot.sendMessage(
          chatId,
          "⚠️ Noma’lum buyruq yoki ro‘yxatdan o‘tish yakunlanmagan."
        );
      }
  }
};

const displayUsersAsButtons = async (chatId, bot) => {
  const users = await User.findAll();
  if (users.length === 0) {
    bot.sendMessage(chatId, "❌ Foydalanuvchilar topilmadi.");
    return;
  }

  const inlineKeyboard = users.map((user) => [
    {
      text: `${user.full_name} - ${user.phone}`,
      callback_data: `delete_${user.id}`,
    },
  ]);

  bot.sendMessage(chatId, "Foydalanuvchilarni o'chirish uchun tanlang:", {
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });
};

module.exports = { commandHandler };
