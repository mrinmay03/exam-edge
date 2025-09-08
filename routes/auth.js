const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// --------------------
// Registration
// --------------------
router.post("/register", async (req, res) => {
  try {
    let { firstName, lastName, phone, email, password, role } = req.body;
    firstName = firstName.trim().toLowerCase();
    lastName = lastName.trim().toLowerCase();
    email = email.trim().toLowerCase(); // Normalize email
    phone = phone.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
      role: role || "user",
      lastLogin: null // Initially null
    });

    await newUser.save(); // createdAt & updatedAt added automatically

    res.status(201).json({ msg: "Registration successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// --------------------
// Login
// --------------------
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase(); // Normalize email

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Set session
    req.session.user = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      role: user.role
    };

    const redirectUrl = user.role === "admin" ? "/admin" : "/user";
    res.status(200).json({ msg: "Login successful", redirect: redirectUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// --------------------
// Logout
// --------------------
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ msg: "Logout failed" });
    res.clearCookie("connect.sid");
    res.redirect("/login?msg=Logout%20successfully");
  });
});

// --------------------
// Get logged-in user info
// --------------------
router.get("/user", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ msg: "Unauthorized" });
  }
});

module.exports = router;
// --------------------
// Update Profile
// --------------------
router.put("/update", async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const userId = req.session.user.id;
    const { firstName, lastName, phone, email } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phone || !email) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Check if email is already used by another user
    const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName: firstName.trim().toLowerCase(),
        lastName: lastName.trim().toLowerCase(),
        phone: phone.trim(),
        email: email.trim().toLowerCase()
      },
      { new: true }
    );

    // Update session
    req.session.user.firstName = updatedUser.firstName;
    req.session.user.lastName = updatedUser.lastName;
    req.session.user.phone = updatedUser.phone;
    req.session.user.email = updatedUser.email;

    res.json({ msg: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
// --------------------
// Change Password
// --------------------
router.put("/change-password", async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const userId = req.session.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "Both current and new passwords are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
