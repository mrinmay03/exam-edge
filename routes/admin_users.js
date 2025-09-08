const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ===== GET all users =====
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GET user stats =====
router.get("/user-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const activeUsersToday = await User.countDocuments({
      lastLogin: { $gte: startOfToday }
    });

    res.json({ totalUsers, activeUsersToday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
