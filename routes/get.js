const express = require("express");
const router = express.Router();
const csrf = require("csurf");

const csrfProtection = csrf({ cookie: true });

router.get("/", (req, res) => {
  res.render("home.ejs", { title: "Home" });
});

router.get("/maktab", csrfProtection, (req, res) => {
  res.render("maktab.ejs", {
    title: "Maktab",
    csrfToken: req.csrfToken(),
  });
});

router.get("/president", csrfProtection, (req, res) => {
  res.render("president.ejs", {
    title: "Prezident Maktabi",
    csrfToken: req.csrfToken(), // Pass CSRF token to the view
  });
});

router.get("/mental", csrfProtection, (req, res) => {
  res.render("mental.ejs", {
    title: "Mental Arifmetika",
    csrfToken: req.csrfToken(), // Pass CSRF token to the view
  });
});

router.get("/imtihon", csrfProtection, (req, res) => {
  res.render("imtihon.ejs", {
    title: "Test Imtihonlari",
    csrfToken: req.csrfToken(), // Pass CSRF token to the view
  });
});

module.exports = router;
