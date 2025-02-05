const { STATES } = require("../utils/stateManager");
const {
  createUser,
  deleteUser,
  getUsersWithPagination,
  generateAllUsersPDF,
} = require("../controllers/UserController");
const { isAdmin } = require("../utils/auth"); // Import the isAdmin function
const User = require("../models/User");

const callbackHandler = (userStates, bot) => {
  return async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data.startsWith("grade_")) {
      // Handle grade selection
      if (
        userStates[chatId] &&
        userStates[chatId].state === STATES.AWAITING_GRADE
      ) {
        userStates[chatId].data.entranceGrade = data.split("_")[1];
        userStates[chatId].state = STATES.AWAITING_DATE_OF_BIRTH;
        bot.sendMessage(
          chatId,
          "Tug‘ilgan sanangizni kiriting (YYYY-MM-DD formatida):"
        );
      } else {
        bot.sendMessage(
          chatId,
          "❌ Noto‘g‘ri buyruq. Iltimos, sinfni tanlang."
        );
      }
    } else if (data === "confirm") {
      // Handle confirmation
      if (userStates[chatId]) {
        const userData = userStates[chatId].data;
        const user = {
          fullName: userData.fullName,
          dateOfBirth: userData.dateOfBirth,
          phone: userData.phone,
          fromWhere: userData.fromWhere,
          fromWhichSchool: userData.school,
          entranceGrade: userData.entranceGrade,
          additionalPhone: userData.additionalPhone,
        };

        await createUser(user, chatId, bot);
        bot.sendMessage(
          chatId,
          "✅ Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi!"
        );

        // Send new buttons after registration
        bot.sendMessage(chatId, "🔙 Asosiy menyu:", {
          reply_markup: {
            keyboard: [
              [
                { text: "📑 Registratsiya" },
                { text: "📞 Biz bilan bog'lanish" },
                { text: "📍 Manzilimiz" },
              ],
            ],
            resize_keyboard: true,
          },
        });

        delete userStates[chatId];
      } else {
        bot.sendMessage(
          chatId,
          "❌ Hech qanday ma'lumot topilmadi. Iltimos, boshidan boshlang."
        );
      }
    } else if (data === "cancel") {
      // Handle cancellation
      if (userStates[chatId]) {
        delete userStates[chatId];
        bot.sendMessage(chatId, "❌ Ro'yxatdan o'tkazish bekor qilindi.");
      } else {
        bot.sendMessage(
          chatId,
          "❌ Hech qanday ma'lumot topilmadi. Iltimos, boshidan boshlang."
        );
      }
    } else if (data.startsWith("delete_")) {
      // Handle user deletion
      if (isAdmin(chatId)) {
        const userId = data.split("_")[1];
        await deleteUser(userId, chatId, bot);
        await displayUsersAsButtons(chatId, bot); // Refresh the user list after deletion
      } else {
        bot.sendMessage(chatId, "❌ Siz admin emassiz.");
      }
    } else if (data.startsWith("prev_page_")) {
      // Handle previous page
      const page = parseInt(data.split("_")[2], 10);
      if (page > 1) {
        await getUsersWithPagination(page - 1, chatId, bot);
      }
    } else if (data.startsWith("next_page_")) {
      // Handle next page
      const page = parseInt(data.split("_")[2], 10);
      await getUsersWithPagination(page + 1, chatId, bot);
    } else if (data === "list_users") {
      // Handle listing all users
      if (isAdmin(chatId)) {
        await displayUsersAsButtons(chatId, bot);
      } else {
        bot.sendMessage(chatId, "❌ Siz admin emassiz.");
      }
    }

    bot.answerCallbackQuery(callbackQuery.id);
  };
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

module.exports = callbackHandler;
