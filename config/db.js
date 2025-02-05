const { Pool } = require("pg");
require("dotenv").config();

class Database {
  constructor() {
    // Initialize the PostgreSQL connection pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Heroku Postgres
      },
    });
  }

  query(text, params) {
    return this.pool.query(text, params);
  }
}

const db = new Database();

module.exports = db;
