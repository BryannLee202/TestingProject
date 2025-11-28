const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

const authController = {
  async register(req, res) {
    try {
      const { name, email, password, address, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Tên, email và mật khẩu là bắt buộc",
        });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email đã được sử dụng" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userData = {
        name,
        email,
        password: hashedPassword,
        address: address || null,
        phone: phone || null,
      };

      const user = await User.create(userData);
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        data: { user: user.toJSON(), token },
      });
    } catch (error) {
      console.error("Register error:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Email và mật khẩu là bắt buộc" });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Email hoặc mật khẩu không đúng" });
      }

      const isPasswordValid = await user.checkPassword(password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ success: false, message: "Email hoặc mật khẩu không đúng" });
      }

      if (user.is_active === false) {
        return res
          .status(401)
          .json({ success: false, message: "Tài khoản đã bị khóa" });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        message: "Đăng nhập thành công",
        data: { user: user.toJSON(), token },
      });
    } catch (error) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: error.message });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy user" });
      }

      res.json({ success: true, data: user.toJSON() });
    } catch (error) {
      console.error("Get profile error:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, address, phone, avatar_url } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy user" });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (address !== undefined) updateData.address = address;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

      await user.update(updateData);

      res.json({
        success: true,
        message: "Cập nhật thành công",
        data: user.toJSON(),
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: error.message });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await user.checkPassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Mật khẩu hiện tại không đúng" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      await user.changePassword(hashedNewPassword);

      res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error) {
      console.error("Change pass error:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: error.message });
    }
  },

  async getAllUsers(req, res) {
    try {
      res.json({ success: true, message: "Danh sách user" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi" });
    }
  },
};

module.exports = authController;
