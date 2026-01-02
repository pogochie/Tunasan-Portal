const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  reporterName: String,
  incidentType: String,
  description: String,
  location: String,

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Incident", IncidentSchema);
