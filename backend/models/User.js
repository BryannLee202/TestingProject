const sql = require("mssql");
const bcrypt = require("bcryptjs");

class User {
  constructor(data) {
    Object.assign(this, data);
  }

  // Gắn method check password
  async checkPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Trả về JSON không lộ password
  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }

  // Update user
  async update(updateData) {
    await sql.query`
      UPDATE Users
      SET 
        name = ${updateData.name ?? this.name},
        address = ${updateData.address ?? this.address},
        phone = ${updateData.phone ?? this.phone},
        avatar_url = ${updateData.avatar_url ?? this.avatar_url}
      WHERE id = ${this.id}
    `;

    Object.assign(this, updateData);
  }

  // Đổi mật khẩu
  async changePassword(newHashedPassword) {
    await sql.query`
      UPDATE Users
      SET password = ${newHashedPassword}
      WHERE id = ${this.id}
    `;

    this.password = newHashedPassword;
  }

  // ===========================
  // STATIC METHODS
  // ===========================
  static async findByEmail(email) {
    const result = await sql.query`
      SELECT * FROM Users WHERE email = ${email}
    `;

    if (result.recordset[0]) {
      return new User(result.recordset[0]); // 🎯 GẮN METHOD VÀO OBJECT
    }

    return null;
  }

  static async findById(id) {
    const result = await sql.query`
      SELECT * FROM Users WHERE id = ${id}
    `;

    if (result.recordset[0]) {
      return new User(result.recordset[0]);
    }

    return null;
  }

  static async create(data) {
    const result = await sql.query`
      INSERT INTO Users (name, email, password, address, phone)
      OUTPUT INSERTED.*
      VALUES (${data.name}, ${data.email}, ${data.password}, ${data.address}, ${data.phone})
    `;

    return new User(result.recordset[0]);
  }
}

module.exports = User;
