const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  reporterName: String,
  incidentType: String,
  description: String,
  location: {
    lat: Number,
    lng: Number
  },
  images: [String],
  status: {
    type: String,
    default: "Pending" // Pending | Approved | Rejected
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Incident", IncidentSchema);
