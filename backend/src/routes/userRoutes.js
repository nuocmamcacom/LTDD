const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Lấy danh sách user
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Tạo user mới
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { email, name } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name,
        elo: 1000,
        matchesPlayed: 0,
        wins: 0,
      });
      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lấy thông tin user theo email
router.get("/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
