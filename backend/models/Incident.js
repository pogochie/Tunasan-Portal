const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: String,
  role: String,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

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
    default: "Pending" // Pending | Approved | Rejected | In Progress | Resolved
  },
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Incident", IncidentSchema);