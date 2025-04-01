// server.js
const express = require("express");
const path = require("path");
const { startBot } = require("./bot/bot"); // We'll create this file next

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Welcome to the server! Use /start to begin the bot interaction.");
});

// Routes for your pages
app.get("/maktab", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "maktab.html"));
});

app.get("/prezident-m", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "prezident-m.html"));
});

app.get("/mental-m", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mental-m.html"));
});

app.get("/test-imtihon", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "test-imtihon.html"));
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
