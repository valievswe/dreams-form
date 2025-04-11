const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

// Import bot-related files
const { startBot } = require("./bot/bot"); // Adjust the path if necessary

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const ejs = require("ejs");
app.set("views", path.join(__dirname, "public/pages"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const getRoutes = require("./routes/get");
const postRoutes = require("./routes/post");

app.use("/", getRoutes);
app.use("/", postRoutes);

// Start server and bot
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Start the Telegram bot after the server starts
  startBot()
    .then(() => {
      console.log("Telegram bot is running");
    })
    .catch((error) => {
      console.error("Failed to start the bot:", error);
    });
});
