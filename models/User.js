const db = require("./../config/db");

class User {
  // Create a new user
  static async create({
    fullName,
    dateOfBirth,
    phone,
    fromWhere,
    fromWhichSchool, // Ensure this matches the column name
    entranceGrade, // Ensure this matches the column name
    additionalPhone,
  }) {
    const query = `
      INSERT INTO users (full_name, date_of_birth, phone, from_where, from_which_school, entrance_grade, additional_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      fullName,
      dateOfBirth,
      phone,
      fromWhere,
      fromWhichSchool, // Ensure this matches the variable name
      entranceGrade, // Ensure this matches the variable name
      additionalPhone,
    ];
    const { rows } = await db.query(query, values);
    console.log("New user created:", rows[0]);

    return rows[0];
  }

  // Get all users
  static async findAll() {
    const query = `SELECT * FROM users;`;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findByPhone(phone) {
    const query = `SELECT * FROM users WHERE phone = $1;`;
    const { rows } = await db.query(query, [phone]);
    return rows[0];
  }

  // Get a user by ID
  static async findById(id) {
    const query = `SELECT * FROM users WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  // Update a user
  static async update(
    id,
    {
      fullName,
      dateOfBirth,
      phone,
      fromWhere,
      fromWhichSchool,
      entranceGrade,
      additionalPhone,
    }
  ) {
    const query = `
      UPDATE users
      SET full_name = $1, date_of_birth = $2, phone = $3, from_where = $4, from_which_school = $5, entrance_grade = $6, additional_phone = $7
      WHERE id = $8
      RETURNING *;
    `;
    const values = [
      fullName,
      dateOfBirth,
      phone,
      fromWhere,
      fromWhichSchool,
      entranceGrade,
      additionalPhone,
      id,
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  // Delete a user
  static async delete(id) {
    const query = `DELETE FROM users WHERE id = $1 RETURNING *;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  // Delete all users
  static async deleteAll() {
    const query = `DELETE FROM users RETURNING *;`;
    const { rows } = await db.query(query);
    return rows;
  }
}

module.exports = User;
