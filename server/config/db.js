const mongoose = require('mongoose');

async function connectDB(mongoUrl) {
  try {
    await mongoose.connect(mongoUrl);
    console.log('[mongo] connected:', mongoUrl);
  } catch (err) {
    console.error('[mongo] error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
