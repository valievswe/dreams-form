// utils/telegram.js
const { validateInitData } = require("./validation");

const extractTelegramUserId = (req) => {
  const { initData } = req.body;

  if (initData) {
    const parsed = validateInitData(initData);
    if (!parsed || !parsed.user || !parsed.user.id) {
      throw new Error("Invalid Telegram initData");
    }
    return parsed.user.id;
  }

  const { telegram_user_id } = req.cookies;
  if (!telegram_user_id) {
    throw new Error("Telegram user ID not found");
  }

  return telegram_user_id;
};

module.exports = { extractTelegramUserId };
