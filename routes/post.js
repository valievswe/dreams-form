// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const csrf = require("csurf");

const mentalController = require("../controller/mentalController");

const csrfProtection = csrf({ cookie: true });

router.post("/mkregister", csrfProtection, mentalController.registerMental);

module.exports = router;
