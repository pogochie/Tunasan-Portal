const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Register new official (status = pending)
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (role !== "official") {
    return res.status(400).json({ message: "Only Barangay Officials can register" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
      role,
      status: "pending"
    });

    await user.save();
    res.json({ message: "Registration submitted. Await admin approval." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending officials (no auth, unprotected)
router.get("/pending", async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending", role: "official" });
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Approve official (no auth, unprotected)
router.post("/:id/approve", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "approved";
    await user.save();
    res.json({ message: "User approved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Reject official (no auth, unprotected)
router.post("/:id/reject", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "rejected";
    await user.save();
    res.json({ message: "User rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
