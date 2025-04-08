// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const csrf = require("csurf");

const csrfProtection = csrf({ cookie: true });

// Example POST route
router.post("/mkregister", csrfProtection, (req, res) => {
  const registrationData = req.body;
  console.log("Received registration data:", registrationData);
  // Save to database or handle logic
  res.json({ message: "Registration successful!" });
});

module.exports = router;
