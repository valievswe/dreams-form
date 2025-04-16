const mentalModel = require("../models/mental.model");
const { validateInitData } = require("../utils/validation");

const registerMental = async (req, res) => {
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
      if (!telegram_user_id) {
        return res
          .status(400)
          .json({ success: false, error: "Telegram user ID not found" });
      }
      telegramUserId = telegram_user_id;
      console.log("Telegram user ID from cookies:", telegramUserId);
    }

    const entry = await mentalModel.createMentalEntry({
      ...formData,
      telegram_user_id: telegramUserId,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error("Error creating mental entry:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getMentals = async (req, res) => {
  try {
    const entries = await mentalModel.getAllMentalEntries();
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    console.error("Error fetching entries:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  registerMental,
  getMentals,
};
