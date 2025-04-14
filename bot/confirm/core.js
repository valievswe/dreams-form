const crypto = require("crypto");
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");
const { bot } = require("./bot");

const BOT_TOKEN = process.env.BOT_TOKEN;

function validateInitData(initDataRaw) {
  const parsed = querystring.parse(initDataRaw);
  const { hash, ...data } = parsed;

  const sorted = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const hmac = crypto.createHmac("sha256", secret).update(sorted).digest("hex");

  if (hmac !== hash) return null;

  return JSON.parse(parsed.user); // this includes id, username, etc.
}

// Example function: called after form submit
async function core(req, res) {
  const { initData, formData } = req.body;

  const telegramUser = validateInitData(initData);
  if (!telegramUser) {
    return res.status(403).json({ error: "Unauthorized Telegram user" });
  }

  const userId = telegramUser.id;

  // Generate confirmation (stubbed as static file)
  const filePath = path.join(__dirname, "documents", "confirmation.pdf");

  // In real use: generate a user-specific PDF and store under a temp or user-based name

  try {
    await bot.telegram.sendDocument(userId, { source: filePath });

    return res.json({ success: true, message: "Document sent to Telegram" });
  } catch (error) {
    console.error("Failed to send document:", error);
    return res.status(500).json({ error: "Failed to send document" });
  }
}

module.exports = { core };
