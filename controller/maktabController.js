const maktabModel = require("../models/maktab.model");
const { validateInitData } = require("../utils/validation");

const registerMaktab = async (req, res) => {
  try {
    const { initData, ...formData } = req.body;

    let telegramUserId = null;

    // If request is from Telegram Mini App
    if (initData) {
      const parsed = validateInitData(initData);

      if (!parsed || !parsed.user || !parsed.user.id) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid Telegram initData" });
      }
      telegramUserId = parsed.user.id;
    } else {
      // If request is from Web App
      const { telegram_user_id } = req.cookies;
      telegramUserId = telegram_user_id;
      console.log("Telegram user ID from cookies:", telegramUserId);
    }

    // Save the registration info
    const entry = await maktabModel.createMaktabEntry({
      ...formData,
      telegram_user_id: telegramUserId,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error("Error creating maktab entry:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getMaktabEntries = async (req, res) => {
  try {
    const entries = await maktabModel.getAllMaktabEntries();
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    console.error("Error fetching maktab entries:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  registerMaktab,
  getMaktabEntries,
};
