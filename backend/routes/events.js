// backend/routes/events.js
const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary (same as incidents)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "barangay_events",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

// Create event
router.post("/", upload.array("images", 3), async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const imagePaths = req.files.map(file => file.path);

    const event = new Event({
      title,
      description,
      date,
      location,
      images: imagePaths,
    });

    await event.save();
    res.json({ message: "Event created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
s
// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;