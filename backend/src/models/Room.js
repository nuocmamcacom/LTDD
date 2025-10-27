const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    hostEmail: { type: String, required: true },
    members: [{ type: String }],           // lưu email cho nhẹ nhàng
    status: { type: String, enum: ["waiting", "playing", "finished"], default: "waiting" },
    timeControlMinutes: { type: Number, default: 10 }, // ⏱️ Game time in minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
