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


module.exports = router;
