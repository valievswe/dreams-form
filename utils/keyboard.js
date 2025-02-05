const { isAdmin } = require("../utils/auth"); // Import the isAdmin function

// Define the custom keyboard (menu) buttons
const getKeyboard = (chatId) => {
  const baseKeyboard = {
    reply_markup: {
      keyboard: [[{ text: "📑 Registratsiya" }, { text: "📚 DTM" }]],
      resize_keyboard: true, // Resize the keyboard for smaller devices
      one_time_keyboard: true, // Hide the keyboard after selection
    },
  };

  if (isAdmin(chatId)) {
    baseKeyboard.reply_markup.keyboard.push([
      { text: "🗑 O'chirish" },
      { text: "📋 Barcha foydalanuvchilar" },
    ]);
  }

  return baseKeyboard;
};

module.exports = { getKeyboard };
