const maktabModel = require("../models/maktab.model");
const { extractTelegramUserId } = require("../utils/getID");

const registerMaktab = async (req, res) => {
  try {
    const { initData, ...formData } = req.body;
    const telegramUserId = extractTelegramUserId(req);

    const entry = await maktabModel.createMaktabEntry({
      ...formData,
      telegram_user_id: telegramUserId,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error("Error creating maktab entry:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

const getMaktabEntries = async (_req, res) => {
  try {
    const entries = await maktabModel.getAllMaktabEntries();
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    console.error("Error fetching maktab entries:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = { registerMaktab, getMaktabEntries };
