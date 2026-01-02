const express = require("express");
const router = express.Router();
const News = require("../models/News");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "barangay_news",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

// Create news (with images)
router.post("/", upload.array("images", 3), async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const imagePaths = req.files.map(file => file.path);

    const news = new News({
      title,
      description,
      images: imagePaths,
    });

    await news.save();
    res.json({ message: "News published successfully" });
  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all news
router.get("/", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;