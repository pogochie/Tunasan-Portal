const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

// Get all incidents
router.get('/', async (req, res) => {
  const incidents = await Incident.find().sort({ createdAt: -1 });
  res.json(incidents);
});

// Create new incident
router.post('/', async (req, res) => {
  const { reporterName, incidentType, description, location } = req.body;
  const incident = new Incident({ reporterName, incidentType, description, location });
  await incident.save();
  res.json({ message: "Incident submitted successfully", incident });
});

// Update status
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  await Incident.findByIdAndUpdate(req.params.id, { status });
  res.json({ message: "Status updated successfully" });
});

module.exports = router;
