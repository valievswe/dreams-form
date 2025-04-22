const pool = require("../config/db");

const createPresidentEntry = async ({
  telegram_user_id = null,
  fullname,
  dob,
  location,
  phone,
  current_grade,
}) => {
  const query = `
    INSERT INTO president (
      telegram_user_id,
      fullname,
      dob,
      location,
      phone,
      current_grade
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    telegram_user_id,
    fullname,
    dob,
    location,
    phone,
    current_grade,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getAllPresidentEntries = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM president ORDER BY created_at DESC"
  );
  return rows;
};

module.exports = {
  createPresidentEntry,
  getAllPresidentEntries,
};
