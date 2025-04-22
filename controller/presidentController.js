const presidentModel = require("../models/prmaktab.model");
const { extractTelegramUserId } = require("../utils/getID");

const registerPresident = async (req, res) => {
  try {
    const { initData, ...formData } = req.body;
    const telegramUserId = extractTelegramUserId(req);

    const entry = await presidentModel.createPresidentEntry({
      ...formData,
      telegram_user_id: telegramUserId,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error("Error creating president entry:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

const getPresidentEntries = async (_req, res) => {
  try {
    const entries = await presidentModel.getAllPresidentEntries();
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    console.error("Error fetching president entries:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = { registerPresident, getPresidentEntries };
