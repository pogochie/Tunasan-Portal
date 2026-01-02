const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  reporterName: String,
  incidentType: String,
  description: String,
  location: String, // changed to string for simplicity
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