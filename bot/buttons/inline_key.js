require("dotenv").config(); // Load .env variables

// Main menu reply keyboard (for regular users)
const mainMenuKeyboard = {
  keyboard: [
    [{ text: "Maktab uchun qabul" }],
    [{ text: "Mening ma'lumotlarim" }], // 🔥 New button added
  ],
  resize_keyboard: true,
  persistent: true,
};

// Admin menu reply keyboard
const adminMenuKeyboard = {
  keyboard: [[{ text: "Ma'lumotlarni olish" }]],
  resize_keyboard: true,
  persistent: true,
};

// Function to determine the appropriate keyboard
function getKeyboardForUser(userId) {
  const adminIds = process.env.ADMIN_IDS
    ? process.env.ADMIN_IDS.split(",").map((id) => id.trim())
    : [];
  return adminIds.includes(userId.toString())
    ? adminMenuKeyboard
    : mainMenuKeyboard;
}

module.exports = { getKeyboardForUser };
