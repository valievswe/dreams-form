// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const csrf = require("csurf");

const mentalController = require("../controller/mentalController");
const dtmController = require("../controller/dtmController");

const csrfProtection = csrf({ cookie: true });

// Mental form route
router.post("/mentalregister", csrfProtection, mentalController.registerMental);

// DTM form route
router.post("/dtmregister", csrfProtection, dtmController.registerDTM);

module.exports = router;
