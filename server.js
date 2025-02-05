const express = require("express");
const app = express();
require("dotenv").config();
const bot = require("./config/bot"); // Import bot instance
const db = require("./config/db");

async function testConnection() {
  try {
    const result = await db.query("SELECT NOW();");
    console.log(
      "Database connected successfully! Current Time:",
      result.rows[0].now
    );
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

const port = process.env.PORT || 5000;

// Test route
app.get("/", (req, res) => {
  res.send("Register bot is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

testConnection();
