// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const csrf = require("csurf");

const mentalController = require("../controller/mentalController");
const dtmController = require("../controller/dtmController");
const maktabController = require("../controller/maktabController");
const presidentController = require("../controller/presidentController");
const adminController = require("../controller/admin.controller");

const csrfProtection = csrf({ cookie: true });

// Mental form route
router.post("/mentalregister", csrfProtection, mentalController.registerMental);

// DTM form route
router.post("/imtihonregister", csrfProtection, dtmController.registerDTM);

//maktab post register
router.post("/mkregister", csrfProtection, maktabController.registerMaktab);

// president form route
router.post(
  "/presidentregister",
  csrfProtection,
  presidentController.registerPresident
);
// Admin route to get all data in XLS format
router.post("/barchasi", adminController.getAllData);

module.exports = router;
