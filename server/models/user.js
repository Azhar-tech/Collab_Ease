const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // ✅ Add role field\
  resetToken: String, // Add resetToken
  resetTokenExpiry: Date, // Add resetTokenExpiry
});

module.exports = mongoose.model('User', UserSchema);
