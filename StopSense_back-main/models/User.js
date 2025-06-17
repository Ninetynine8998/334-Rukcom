const mongoose = require('mongoose');

// สร้าง schema สำหรับข้อมูลผู้ใช้
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, default: 'inactive' }, // default คือ inactive
  user_id: { type: String, required: true, unique: true },
  create_date: { type: Date, default: Date.now },
  modify_date: { type: Date, default: Date.now },
});

// สร้าง model สำหรับ User
const User = mongoose.model('User', userSchema);

module.exports = User;
