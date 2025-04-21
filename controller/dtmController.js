// controllers/dtm.controller.js
const dtmModel = require("../models/dtm.model");
const { validateInitData } = require("../utils/validation");

// Validation helper
const validateDTMForm = ({ fullname, dob, phone, subject }) => {
  return fullname && dob && phone && subject;
};

const registerDTM = async (req, res) => {
  try {
    const { initData, ...formData } = req.body;

    // Basic server-side form validation
    if (!validateDTMForm(formData)) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid form fields",
      });
    }

    let telegramUserId = null;

    // Telegram Mini App
    if (initData) {
      const parsed = validateInitData(initData);

      if (!parsed || !parsed.user || !parsed.user.id) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid Telegram initData" });
      }
      telegramUserId = parsed.user.id;
    } else {
      // Web App fallback
      const { telegram_user_id } = req.cookies;
      if (!telegram_user_id) {
        return res
          .status(400)
          .json({ success: false, error: "Telegram user ID not found" });
      }
      telegramUserId = telegram_user_id;
    }

    const entry = await dtmModel.createDTMEntry({
      ...formData,
      telegram_user_id: telegramUserId,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error("Error creating DTM entry:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getDTMs = async (req, res) => {
  try {
    const entries = await dtmModel.getAllDTMEntries();
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    console.error("Error fetching DTM entries:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  registerDTM,
  getDTMs,
};
