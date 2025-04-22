const mentalModel = require("../models/mental.model");
const { extractTelegramUserId } = require("../utils/getID");

const registerMental = async (req, res) => {
  try {
    const { initData, ...formData } = req.body;
    const telegramUserId = extractTelegramUserId(req);

    const entry = await mentalModel.createMentalEntry({
      ...formData,
      telegram_user_id: telegramUserId,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error("Error creating mental entry:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

const getMentals = async (_req, res) => {
  try {
    const entries = await mentalModel.getAllMentalEntries();
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    console.error("Error fetching mental entries:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = { registerMental, getMentals };
