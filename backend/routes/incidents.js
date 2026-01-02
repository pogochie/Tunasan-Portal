require('dotenv').config();
const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   // set in your environment variables
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "barangay_incidents",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});



const upload = multer({ storage });

// Create incident (with images)
router.post("/", (req, res, next) => {
  upload.array("images", 3)(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: "Image upload failed" });
    }

    try {
      const { reporterName, incidentType, description, location } = req.body;

      // Safely handle req.files
      const imagePaths = req.files.map(file => file.path); // full Cloudinary URL
      const loc = {
  lat: parseFloat(location.lat),
  lng: parseFloat(location.lng),
};

      const incident = new Incident({
        reporterName,
        incidentType,
        description,
        location,
        images: imagePaths,
        status: "Pending"
      });

      await incident.save();
      res.json({ message: "Report submitted for review" });
    } catch (error) {
      console.error("Error saving incident:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
});

// Get all incidents
router.get("/", async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single incident by id
router.get("/:id", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const News = require("../models/News");

// Approve incident and create news
router.post("/:id/approve", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    if (incident.status === "Approved") {
      return res.status(400).json({ message: "Incident already approved" });
    }

    // Create news from incident
    const news = new News({
      title: incident.incidentType,
      description: incident.description,
      images: incident.images,
      location: incident.location,
    });
    await news.save();

    // Update incident status
    incident.status = "Approved";
    await incident.save();

    res.json({ message: "Incident approved and news published" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject incident
router.post("/:id/reject", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    incident.status = "Rejected";
    await incident.save();

    res.json({ message: "Incident rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete incident by ID
router.delete("/:id", async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    res.json({ message: "Incident deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;