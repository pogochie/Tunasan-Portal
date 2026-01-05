const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary (reuse your environment keys)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage for Barangay ID uploads
const idStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "barangay_ids",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
  },
});
const uploadId = multer({ storage: idStorage });

// Register new official (status = pending) with Barangay ID image upload (Cloudinary)
router.post("/register", (req, res) => {
  uploadId.single("idImage")(req, res, async (err) => {
    if (err) {
      console.error("ID upload error:", err);
      return res.status(400).json({ message: "ID image upload failed" });
    }
    try {
      const { username, password, role } = req.body;

      if (role !== "official") {
        return res.status(400).json({ message: "Only Barangay Officials can register" });
      }
      // Require an ID image for officials
      if (!req.file || !req.file.path) {
        return res.status(400).json({ message: "Barangay Official ID image is required" });
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        password: hashedPassword,
        role,
        status: "pending",
        idImage: req.file.path,                    // Cloudinary URL
        idImagePublicId: req.file.filename || "",  // Cloudinary public_id if available
      });

      await user.save();
      res.json({ message: "Registration submitted. Await admin approval." });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  });
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
