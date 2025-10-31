const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" Mongo kết nối được rồi ní ơi");
  } catch (error) {
    console.error("Mongo lỗi rồi mày ơi:", error.message);
    // Don't retry automatically to avoid spam
  }
};

module.exports = connectDB;
