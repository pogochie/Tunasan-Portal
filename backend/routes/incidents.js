require('dotenv').config();
const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");
const News = require("../models/News");

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
  const io = req.app.get("io"); // get io instance

  upload.array("images", 3)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Image upload failed" });
    }
    try {
      const { reporterName, incidentType, description, location } = req.body;
      const imagePaths = req.files.map(file => file.path);

      const incident = new Incident({
        reporterName,
        incidentType,
        description,
        location,
        images: imagePaths,
        status: "Pending"
      });

      await incident.save();

      // Emit event to notify admins/officials
      io.emit("newIncident", incident);

      res.json({ message: "Report submitted for review" });
    } catch (error) {
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

// Approve incident and create news
router.post("/:id/approve", async (req, res) => {
  const io = req.app.get("io");
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

    incident.status = "Approved";
    await incident.save();

    // Emit event to notify residents about status update
    io.emit("incidentStatusUpdated", { id: incident._id, status: incident.status });

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

// Get comments for an incident
router.get("/:id/comments", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    res.json(incident.comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a comment to an incident
router.post("/:id/comments", async (req, res) => {
  const { user, role, comment } = req.body;

  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    incident.comments.push({ user, role, comment });
    await incident.save();

    // Emit socket event for new comment
    const io = req.app.get("io");
    io.emit("newComment", { incidentId: req.params.id, user, role, comment });

    res.json({ message: "Comment added" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update incident by ID
router.put("/:id", (req, res, next) => {
  const upload = multer({ storage }).array("images", 3); // reuse your multer storage

  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: "Image upload failed" });
    }

    try {
      const updateData = { ...req.body };

      // If images uploaded, replace images array
      if (req.files && req.files.length > 0) {
        updateData.images = req.files.map(file => file.path);
      }

      // Parse location if sent as JSON string
      if (typeof updateData.location === "string") {
        updateData.location = JSON.parse(updateData.location);
      }

      const incident = await Incident.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!incident) return res.status(404).json({ message: "Incident not found" });

      res.json({ message: "Incident updated successfully", incident });
    } catch (error) {
      console.error("Error updating incident:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
});

module.exports = router;