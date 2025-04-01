// buttons/keyboards.js
require("dotenv").config(); // Load .env variables

// Main menu reply keyboard (persistent below text input)
const mainMenuKeyboard = {
  keyboard: [[{ text: "Maktab uchun qabul" }]],
  resize_keyboard: true,
  persistent: true,
};

// Admin menu reply keyboard (persistent below text input)
const adminMenuKeyboard = {
  keyboard: [[{ text: "Ma'lumotlarni olish" }]],
  resize_keyboard: true,
  persistent: true,
};

// Admission process inline keyboard (triggered by callback)
const admissionKeyboard = {
  inline_keyboard: [
    [{ text: "Maktab", callback_data: "school_admission" }],
    [{ text: "Prezident Maktabi", callback_data: "president_admission" }],
    [{ text: "Orqaga", callback_data: "back_to_main" }],
  ],
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

module.exports = { getKeyboardForUser, admissionKeyboard };
