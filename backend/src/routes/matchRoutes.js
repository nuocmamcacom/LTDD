const express = require("express");
const Match = require("../models/Match");
const User = require("../models/User");
const router = express.Router();

// ✅ Lấy danh sách trận đấu
router.get("/", async (req, res) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Lấy match history của user
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const matches = await Match.find({
      $or: [{ whitePlayer: email }, { blackPlayer: email }]
    }).sort({ createdAt: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Tạo trận mới
router.post("/", async (req, res) => {
  try {
    const match = new Match(req.body);
    await match.save();
    res.json(match);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Cập nhật kết quả trận đấu
router.patch("/:id/finish", async (req, res) => {
  try {
    const { id } = req.params;
    const { winner, endReason, finalFen, duration, whiteTimeLeft, blackTimeLeft } = req.body;

    const match = await Match.findByIdAndUpdate(
      id,
      { winner, endReason, finalFen, duration, whiteTimeLeft, blackTimeLeft },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // ✅ Update player stats
    await updatePlayerStats(match);

    console.log("✅ [MATCH FINISHED]", { id, winner, endReason });
    res.json(match);
  } catch (err) {
    console.error("❌ [ERROR FINISH MATCH]", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Thêm move vào match
router.patch("/:id/move", async (req, res) => {
  try {
    const { id } = req.params;
    const { san, fen } = req.body;

    const match = await Match.findByIdAndUpdate(
      id,
      { $push: { moves: { san, fen, timestamp: new Date() } } },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Helper function to update player stats
async function updatePlayerStats(match) {
  try {
    const { whitePlayer, blackPlayer, winner } = match;

    // Update white player stats
    const whiteUpdate = { $inc: { matchesPlayed: 1 } };
    if (winner === 'w') whiteUpdate.$inc.wins = 1;
    await User.findOneAndUpdate({ email: whitePlayer }, whiteUpdate);

    // Update black player stats  
    const blackUpdate = { $inc: { matchesPlayed: 1 } };
    if (winner === 'b') blackUpdate.$inc.wins = 1;
    await User.findOneAndUpdate({ email: blackPlayer }, blackUpdate);

    console.log("✅ [STATS UPDATED]", { whitePlayer, blackPlayer, winner });
  } catch (err) {
    console.error("❌ [ERROR UPDATE STATS]", err);
  }
}

module.exports = router;
