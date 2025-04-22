const dtmModel = require("../models/dtm.model");
const { extractTelegramUserId } = require("../utils/getID");

const validateDTMForm = ({ fullname, dob, phone, subject }) =>
  fullname && dob && phone && subject;

const registerDTM = async (req, res) => {
  try {
    const { initData, ...formData } = req.body;

    if (!validateDTMForm(formData)) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid form fields",
      });
    }

    const telegramUserId = extractTelegramUserId(req);

    const entry = await dtmModel.createDTMEntry({
      ...formData,
      telegram_user_id: telegramUserId,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error("Error creating DTM entry:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

const getDTMs = async (_req, res) => {
  try {
    const entries = await dtmModel.getAllDTMEntries();
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    console.error("Error fetching DTM entries:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = { registerDTM, getDTMs };
