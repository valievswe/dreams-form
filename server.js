// server.js
const express = require("express");
const path = require("path");
const { startBot } = require("./bot/bot"); // We'll create this file next

const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

const ejs = require("ejs");
app.set("views", path.join(__dirname, "public/pages")); // Ensure Express looks for EJS files in /views
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("home.ejs", { title: "Home" });
});

// Routes for your pages
app.get("/maktab", (req, res) => {
  res.render("maktab.ejs", { title: "Maktab" });
});

app.get("/president", (req, res) => {
  res.render("president.ejs", { title: "Prezident Maktabi" });
});

app.get("/mental", (req, res) => {
  res.render("mental.ejs", { title: "Mental Arifmetika" });
});

app.get("/imtihon", (req, res) => {
  res.render("imtihon.ejs", { title: "Test Imtihonlari" });
});

// Start both Express server and Telegram bot
const startServer = async () => {
  try {
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Start Telegram bot
    await startBot();
    console.log("Telegram bot is running");
  } catch (error) {
    console.error("Error starting server/bot:", error);
  }
};

startServer();
