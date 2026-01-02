const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

router.get('/', async (req, res) => {
  const incidents = await Incident.find().sort({ createdAt: -1 });
  res.json(incidents);
});

router.post('/', async (req, res) => {
  console.log("POST /api/incidents HIT");
  console.log(req.body);

  const { reporterName, incidentType, description, location } = req.body;

  const incident = new Incident({
    reporterName,
    incidentType,
    description,
    location
  });

  await incident.save();
  res.json({ message: "Incident saved" });
});

// Approve or Reject incident
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  await Incident.findByIdAndUpdate(req.params.id, { status });
  res.json({ message: `Incident ${status}` });
});



module.exports = router;
