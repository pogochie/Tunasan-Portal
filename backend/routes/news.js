const express = require("express");
const router = express.Router();
const News = require("../models/News");
const Incident = require("../models/Incident");

router.post("/approve/:id", async (req, res) => {
  const incident = await Incident.findById(req.params.id);

  incident.status = "approved";
  await incident.save();

  const news = new News({
    title: incident.incidentType,
    content: incident.description,
    images: incident.images,
    sourceIncidentId: incident._id
  });

  await news.save();
  res.json({ message: "Incident approved and published as news" });
});

module.exports = router;
