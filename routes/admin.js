const express = require("express");
const router = express.Router();
const User = require("../models/User");

// --------------------
// GET all users
// --------------------
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// GET user stats (for dashboard)
// --------------------
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

// --------------------
// EDIT user (update firstName & lastName)
// --------------------
router.put("/users/:id", async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    await User.findByIdAndUpdate(req.params.id, { firstName, lastName });
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// DELETE user
// --------------------
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// ADD new user
// --------------------
router.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, email, role, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "User already exists" });

    const newUser = new User({ firstName, lastName, email, role, password });
    await newUser.save();
    res.json({ message: "User added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
