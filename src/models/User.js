const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async findAll() {
    const query = `
      SELECT id, email, full_name, phone, role, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT id, email, full_name, phone, role, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async create(userData) {
    const { email, password, fullName, phone, role = 'operator' } = userData;
    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, phone, role, is_active, created_at, updated_at
    `;
    const result = await pool.query(query, [email, passwordHash, fullName, phone, role]);
    return result.rows[0];
  }

  static async update(id, userData) {
    const { email, fullName, phone, role, isActive } = userData;

    const query = `
      UPDATE users
      SET email = COALESCE($1, email),
          full_name = COALESCE($2, full_name),
          phone = COALESCE($3, phone),
          role = COALESCE($4, role),
          is_active = COALESCE($5, is_active)
      WHERE id = $6
      RETURNING id, email, full_name, phone, role, is_active, created_at, updated_at
    `;
    const result = await pool.query(query, [email, fullName, phone, role, isActive, id]);
    return result.rows[0];
  }

  static async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
    `;
    await pool.query(query, [passwordHash, id]);
  }

  static async delete(id) {
    const query = `DELETE FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
