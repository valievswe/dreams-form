// models/mentalModel.js
const pool = require("../config/db");

const createMentalEntry = async ({
  telegram_user_id = null,
  fullname,
  dob,
  age,
  location,
  phone,
  level,
}) => {
  const query = `
    INSERT INTO mental (telegram_user_id, fullname, dob, age, location, phone, level)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [telegram_user_id, fullname, dob, age, location, phone, level];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getAllMentalEntries = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM mental ORDER BY created_at DESC"
  );
  return rows;
};

module.exports = {
  createMentalEntry,
  getAllMentalEntries,
};
