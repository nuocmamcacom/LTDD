// backend/src/routes/roomRoutes.js
const express = require("express");
const Room = require("../models/Room");

const router = express.Router();

// 📌 Lấy danh sách phòng
router.get("/", async (req, res) => {
  try {
    console.log("📥 [GET /api/rooms]");
    const rooms = await Room.find();
    console.log("✅ [ROOM LIST]", rooms.map(r => ({ roomId: r.roomId, members: r.members })));
    res.json(rooms);
  } catch (err) {
    console.error("❌ [ERROR GET ROOMS]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Lấy thông tin một phòng cụ thể
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 [GET /api/rooms/:id]", { roomId: id });

    const room = await Room.findOne({ roomId: id });
    if (!room) {
      console.warn("⚠️ [ROOM NOT FOUND]", id);
      return res.status(404).json({ error: "Room not found" });
    }

    console.log("✅ [ROOM FOUND]", room);
    res.json(room);
  } catch (err) {
    console.error("❌ [ERROR GET ROOM]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Tạo phòng mới
router.post("/", async (req, res) => {
  try {
    const { roomId, hostEmail, timeControlMinutes = 10 } = req.body;
    console.log("📥 [POST /api/rooms]", { roomId, hostEmail, timeControlMinutes });

    const exists = await Room.findOne({ roomId });
    if (exists) {
      console.warn("⚠️ [ROOM EXISTS]", roomId);
      return res.status(400).json({ error: "Room already exists" });
    }

    const newRoom = new Room({
      roomId,
      hostEmail,
      members: [hostEmail],
      status: "waiting",
      timeControlMinutes,
    });

    await newRoom.save();
    console.log("✅ [ROOM CREATED]", newRoom);
    res.json(newRoom);
  } catch (err) {
    console.error("❌ [ERROR CREATE ROOM]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Tham gia phòng
router.patch("/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    console.log("📥 [PATCH /api/rooms/:id/join]", { 
      originalId: id, 
      idLength: id.length,
      email,
      fullUrl: req.originalUrl 
    });

    const room = await Room.findOne({ roomId: id });
    if (!room) {
      console.warn("⚠️ [ROOM NOT FOUND]", id);
      // Log all existing rooms to help debug
      const allRooms = await Room.find({}, 'roomId');
      console.log("📋 [EXISTING ROOMS]", allRooms.map(r => r.roomId));
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.members.includes(email)) {
      console.warn("⚠️ [ALREADY IN ROOM]", { id, email });
      return res.status(400).json({ error: "User already in room" });
    }

    if (room.members.length >= 2) {
      console.warn("⚠️ [ROOM FULL]", id);
      return res.status(400).json({ error: "Room is full" });
    }

    room.members.push(email);
    await room.save();
    console.log("✅ [JOIN SUCCESS]", { id, members: room.members });
    res.json(room);
  } catch (err) {
    console.error("❌ [ERROR JOIN ROOM]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Xóa phòng (chỉ host mới được xóa)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    console.log("📥 [DELETE /api/rooms/:id]", { roomId: id, requesterEmail: email });

    const room = await Room.findOne({ roomId: id });
    if (!room) {
      console.warn("⚠️ [ROOM NOT FOUND]", id);
      return res.status(404).json({ error: "Room not found" });
    }

    // Chỉ host mới được xóa phòng
    if (room.hostEmail !== email) {
      console.warn("⚠️ [UNAUTHORIZED DELETE]", { 
        roomId: id, 
        hostEmail: room.hostEmail, 
        requesterEmail: email 
      });
      return res.status(403).json({ error: "Only room host can delete the room" });
    }

    // Không cho xóa nếu đang có game đang diễn ra
    if (room.status === "playing") {
      console.warn("⚠️ [GAME IN PROGRESS]", id);
      return res.status(400).json({ error: "Cannot delete room while game is in progress" });
    }

    await Room.findOneAndDelete({ roomId: id });
    console.log("✅ [ROOM DELETED]", { roomId: id, hostEmail: email });
    
    res.json({ 
      message: "Room deleted successfully", 
      roomId: id,
      deletedBy: email 
    });
  } catch (err) {
    console.error("❌ [ERROR DELETE ROOM]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
