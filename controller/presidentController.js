const presidentModel = require("../models/prmaktab.model");
const { validateInitData } = require("../utils/validation");

const registerPresident = async (req, res) => {
  try {
    const { initData, ...formData } = req.body;

    let telegramUserId = null;

    // Check Telegram Mini App
    if (initData) {
      const parsed = validateInitData(initData);

      if (!parsed || !parsed.user || !parsed.user.id) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid Telegram initData" });
      }

      telegramUserId = parsed.user.id;
    } else {
      const { telegram_user_id } = req.cookies;
      telegramUserId = telegram_user_id;
      console.log("Telegram user ID from cookies:", telegramUserId);
    }

    const entry = await presidentModel.createPresidentEntry({
      ...formData,
      telegram_user_id: telegramUserId,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error("Error creating president entry:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getPresidentEntries = async (req, res) => {
  try {
    const entries = await presidentModel.getAllPresidentEntries();
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    console.error("Error fetching president entries:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  registerPresident,
  getPresidentEntries,
};
