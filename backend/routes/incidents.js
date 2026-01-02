const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");
const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create incident (with images)
router.post("/", upload.array("images", 3), async (req, res) => {
  try {
    console.log("POST /api/incidents hit");
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const { reporterName, incidentType, description, location } = req.body;

    // If location is JSON string, parse it; else keep as string
    let loc = location;
    if (typeof location === "string") {
      try {
        loc = JSON.parse(location);
      } catch {
        // keep as string if not JSON
      }
    }

    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

    const incident = new Incident({
      reporterName,
      incidentType,
      description,
      location: loc,
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

module.exports = router;