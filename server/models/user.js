const mongoose = require('mongoose');

const USER_ROLES = ['admin', 'chef', 'manager'];

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    match: /^U-\d{5}$/, // U-00001
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minlength:2,
    maxlength: 100,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // email format
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true,
    match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  },
  fullName: {
    type: String,
    required: true,
    minlength:2,
    maxlength: 100,
    match: /^[A-Za-z\s'-]+$/, // characters, no numbers or special characters except spaces, hyphens, and apostrophes
    trim: true
  },  
  role: {
    type: String,
    enum: USER_ROLES,
    default: 'chef'
  },
  phone: {
    type: String,
    trim: true,
    match: /^(\+?\d[\d\s-]{6,})?$/
  },
  createdAt: {
    type: String, //YYYY-MM-DD
    default: () => new Date().toISOString().slice(0, 10)
  },
  updatedAt: {
    type: String, //YYYY-MM-DD
    default: () => new Date().toISOString().slice(0, 10)
  },
  isLoggedIn: { type: Boolean, default: false }
}, { versionKey: false });

userSchema.index({ userId: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
