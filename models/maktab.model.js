const pool = require("../config/db");

const createMaktabEntry = async ({
  telegram_user_id = null,
  fullname,
  dob,
  location,
  previous_school,
  grade,
  phone,
}) => {
  const query = `
    INSERT INTO maktab (
      telegram_user_id,
      fullname,
      dob,
      location,
      previous_school,
      grade,
      phone
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    telegram_user_id,
    fullname,
    dob,
    location,
    previous_school,
    grade,
    phone,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getAllMaktabEntries = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM maktab ORDER BY created_at DESC"
  );
  return rows;
};

module.exports = {
  createMaktabEntry,
  getAllMaktabEntries,
};
