const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "official"], required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  // ADD: Cloudinary URL for uploaded Barangay Official ID image
  idImage: { type: String },            // e.g., https://res.cloudinary.com/.../image/upload/...
  idImagePublicId: { type: String },    // optional: cloudinary public_id for later management
});

module.exports = mongoose.model("User", UserSchema);