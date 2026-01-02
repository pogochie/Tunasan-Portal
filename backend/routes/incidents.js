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
  const { reporterName, incidentType, description, location } = req.body;

  const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

  const incident = new Incident({
    reporterName,
    incidentType,
    description,
    location,
    images: imagePaths,
    status: "pending"
  });

  await incident.save();
  res.json({ message: "Report submitted for review" });
});

// Get all incidents
router.get("/", async (req, res) => {
  const incidents = await Incident.find().sort({ createdAt: -1 });
  res.json(incidents);
});

module.exports = router;
