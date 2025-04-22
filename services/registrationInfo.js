const pool = require("../config/db");

async function getUserRegistrations(telegram_user_id) {
  const results = {};

  // Search DTM
  const dtmRes = await pool.query(
    "SELECT * FROM dtm_imtihon WHERE telegram_user_id = $1 LIMIT 1",
    [telegram_user_id]
  );
  if (dtmRes.rowCount > 0) results.dtm = dtmRes.rows[0];

  // Search Maktab
  const maktabRes = await pool.query(
    "SELECT * FROM maktab WHERE telegram_user_id = $1 LIMIT 1",
    [telegram_user_id]
  );
  if (maktabRes.rowCount > 0) results.maktab = maktabRes.rows[0];

  // Search Mental
  const mentalRes = await pool.query(
    "SELECT * FROM mental WHERE telegram_user_id = $1 LIMIT 1",
    [telegram_user_id]
  );
  if (mentalRes.rowCount > 0) results.mental = mentalRes.rows[0];

  // Search President
  const presidentRes = await pool.query(
    "SELECT * FROM president WHERE telegram_user_id = $1 LIMIT 1",
    [telegram_user_id]
  );
  if (presidentRes.rowCount > 0) results.president = presidentRes.rows[0];

  return results;
}

module.exports = { getUserRegistrations };
