const pool = require("../config/db");

const createDTMEntry = async ({
  telegram_user_id = null,
  fullname,
  dob,
  phone,
  subject,
}) => {
  const query = `
    INSERT INTO dtm_imtihon (telegram_user_id, fullname, dob, phone, subject)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [telegram_user_id, fullname, dob, phone, subject];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getAllDTMEntries = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM dtm_imtihon ORDER BY registered_at DESC"
  );
  return rows;
};

module.exports = {
  createDTMEntry,
  getAllDTMEntries,
};
