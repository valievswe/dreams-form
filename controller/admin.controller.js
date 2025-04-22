const xlsx = require("xlsx");
const mentalModel = require("../models/mental.model");
const dtmModel = require("../models/dtm.model");
const maktabModel = require("../models/maktab.model");
const presidentModel = require("../models/prmaktab.model");

const adminController = {
  async getAllData(req, res) {
    const { telegram_id } = req.body;

    // 1. Validate Admin
    const adminIds =
      process.env.ADMIN_IDS?.split(",").map((id) => id.trim()) || [];

    if (!adminIds.includes(telegram_id?.toString())) {
      console.log(`Access denied for ID: ${telegram_id}`);
      return res.status(403).json({
        error: `Access denied. Not an admin. Your ID: ${telegram_id}`,
      });
    }

    console.log(`Admin access granted for ID: ${telegram_id}`);

    try {
      // 2. Fetch All Data directly from models
      const [mentalData, dtmData, maktabData, presidentData] =
        await Promise.all([
          mentalModel.getAllMentalEntries().catch((e) => {
            console.error("Mental data error:", e);
            return [];
          }),
          dtmModel.getAllDTMEntries().catch((e) => {
            console.error("DTM data error:", e);
            return [];
          }),
          maktabModel.getAllMaktabEntries().catch((e) => {
            console.error("Maktab data error:", e);
            return [];
          }),
          presidentModel.getAllPresidentEntries().catch((e) => {
            console.error("President data error:", e);
            return [];
          }),
        ]);

      // 3. Validate data structure
      const dataValid = [mentalData, dtmData, maktabData, presidentData].every(
        (data) => Array.isArray(data)
      );

      if (!dataValid) {
        throw new Error("Invalid data format from one or more models");
      }

      // 4. Generate workbook
      const wb = xlsx.utils.book_new();

      if (mentalData.length > 0) {
        const sheet = xlsx.utils.json_to_sheet(mentalData);
        xlsx.utils.book_append_sheet(wb, sheet, "Mental Data");
      }
      if (dtmData.length > 0) {
        const sheet = xlsx.utils.json_to_sheet(dtmData);
        xlsx.utils.book_append_sheet(wb, sheet, "DTM Data");
      }
      if (maktabData.length > 0) {
        const sheet = xlsx.utils.json_to_sheet(maktabData);
        xlsx.utils.book_append_sheet(wb, sheet, "Maktab Data");
      }
      if (presidentData.length > 0) {
        const sheet = xlsx.utils.json_to_sheet(presidentData);
        xlsx.utils.book_append_sheet(wb, sheet, "President Data");
      }

      // 5. Respond with Excel file
      const buffer = xlsx.write(wb, {
        bookType: "xlsx",
        type: "buffer",
      });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=barchasi.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      return res.send(buffer);
    } catch (err) {
      console.error("Final error in getAllData:", err);
      return res.status(500).json({
        error: "Failed to generate report",
        details: err.message,
      });
    }
  },
};

module.exports = adminController;
