const xlsx = require("xlsx");
const mentalController = require("./mentalController");
const dtmController = require("./dtmController");
const maktabController = require("./maktabController");
const presidentController = require("./presidentController");

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
      // 2. Fetch All Data with Parallel Requests
      const [mentalData, dtmData, maktabData, presidentData] =
        await Promise.all([
          mentalController.getMentals().catch((e) => {
            console.error("Mental data error:", e);
            return [];
          }),
          dtmController.getDTMs().catch((e) => {
            console.error("DTM data error:", e);
            return [];
          }),
          maktabController.getMaktabEntries().catch((e) => {
            console.error("Maktab data error:", e);
            return [];
          }),
          presidentController.getPresidentEntries().catch((e) => {
            console.error("President data error:", e);
            return [];
          }),
        ]);

      // 3. Validate Data
      const dataValid = [mentalData, dtmData, maktabData, presidentData].every(
        (data) => Array.isArray(data)
      );

      if (!dataValid) {
        throw new Error("Invalid data format from one or more controllers");
      }

      // 4. Create Excel Workbook
      const wb = xlsx.utils.book_new();

      // Add sheets only if data exists
      if (mentalData.length > 0) {
        const mentalSheet = xlsx.utils.json_to_sheet(mentalData);
        xlsx.utils.book_append_sheet(wb, mentalSheet, "Mental Data");
      }

      if (dtmData.length > 0) {
        const dtmSheet = xlsx.utils.json_to_sheet(dtmData);
        xlsx.utils.book_append_sheet(wb, dtmSheet, "DTM Data");
      }

      if (maktabData.length > 0) {
        const maktabSheet = xlsx.utils.json_to_sheet(maktabData);
        xlsx.utils.book_append_sheet(wb, maktabSheet, "Maktab Data");
      }

      if (presidentData.length > 0) {
        const presidentSheet = xlsx.utils.json_to_sheet(presidentData);
        xlsx.utils.book_append_sheet(wb, presidentSheet, "President Data");
      }

      // 5. Generate and Send Excel File
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
